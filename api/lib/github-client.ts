/**
 * GitHub API client
 * Centralizes all GitHub API interactions with consistent auth and error handling
 */

import type { User } from '../types'
import { GitHubAPIError } from './errors'
import { logger } from './logger'

const GITHUB_API_BASE = 'https://api.github.com'
const GITHUB_GRAPHQL_ENDPOINT = `${GITHUB_API_BASE}/graphql`

/**
 * Creates authorization headers for GitHub API requests
 */
const getAuthHeaders = (isGraphQL = false): HeadersInit => {
  const headers: HeadersInit = {}

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = isGraphQL
      ? `bearer ${process.env.GITHUB_TOKEN}`
      : `token ${process.env.GITHUB_TOKEN}`
  }

  if (isGraphQL) {
    headers['Content-Type'] = 'application/json'
    headers['User-Agent'] = 'GitHub GraphQL API'
  }

  return headers
}

/**
 * Makes a REST API request to GitHub
 */
const fetchFromGitHub = async <T>(endpoint: string, label?: string): Promise<T> => {
  const url = endpoint.startsWith('http') ? endpoint : `${GITHUB_API_BASE}${endpoint}`

  logger.debug(`GitHub API request for ${label || endpoint}`)

  let response = await fetch(url, { headers: getAuthHeaders() })

  if (response.status === 401 && process.env.GITHUB_TOKEN) {
    logger.warn('GitHub token rejected, retrying without auth', { endpoint: url })
    response = await fetch(url)
  }

  if (!response.ok) {
    throw new GitHubAPIError(
      `GitHub API returned a ${response.status} ${response.statusText || 'Unknown Error'}`,
      response.status,
      endpoint
    )
  }

  return response.json() as Promise<T>
}

/**
 * Makes a GraphQL request to GitHub
 */
const fetchGraphQL = async <T>(
  query: string,
  variables?: Record<string, unknown>,
  label?: string
): Promise<T> => {
  logger.debug(`GitHub GraphQL request for ${label || 'unknown'}`)

  const response = await fetch(GITHUB_GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    throw new GitHubAPIError(`GitHub API returned a ${response.status}`, response.status, 'graphql')
  }

  const json = (await response.json()) as T & { errors?: { message: string }[] }

  if (json.errors?.length) {
    throw new GitHubAPIError(`GraphQL error: ${json.errors[0].message}`, 200, 'graphql')
  }

  return json
}

interface GraphQLUserNode {
  login: string
  name: string
  avatarUrl: string
}

const mapGraphQLNodes = (nodes: GraphQLUserNode[]): User[] =>
  nodes.map(({ login, name, avatarUrl }) => ({ login, name: name || '', avatarUrl }))

/**
 * Fetches contributors for a repository
 */
export const fetchContributors = async (
  owner: string,
  repo: string,
  limit = 96
): Promise<User[]> => {
  interface GitHubContributor {
    login: string
    name: string
    avatar_url: string
    contributions: number
  }

  const endpoint = `/repos/${owner}/${repo}/contributors?per_page=100`
  const contributors = await fetchFromGitHub<GitHubContributor[]>(
    endpoint,
    `Contributors of ${owner}/${repo}`
  )

  return contributors.slice(0, limit).map((user) => ({
    login: user.login,
    name: user.name || '',
    avatarUrl: user.avatar_url,
  }))
}

/**
 * Fetches stargazers for a repository
 */
export const fetchStargazers = async (owner: string, repo: string, limit = 96): Promise<User[]> => {
  if (process.env.GITHUB_TOKEN) {
    try {
      const query = `
        query($owner: String!, $repo: String!, $limit: Int!) {
          repository(owner: $owner, name: $repo) {
            stargazers(first: $limit, orderBy: {field: STARRED_AT, direction: DESC}) {
              nodes { login name avatarUrl(size: 100) }
            }
          }
        }
      `
      interface Res {
        data: { repository: { stargazers: { nodes: GraphQLUserNode[] } } }
      }
      const res = await fetchGraphQL<Res>(
        query,
        { owner, repo, limit },
        `Stargazers of ${owner}/${repo}`
      )
      return mapGraphQLNodes(res.data.repository?.stargazers.nodes ?? [])
    } catch {
      logger.warn('GraphQL stargazers request failed, falling back to REST', { owner, repo })
    }
  }

  const data = await fetchFromGitHub<{ login: string; name: string; avatar_url: string }[]>(
    `/repos/${owner}/${repo}/stargazers?per_page=100`,
    `Stargazers of ${owner}/${repo}`
  )
  return [...data]
    .reverse()
    .slice(0, limit)
    .map((u) => ({ login: u.login, name: u.name || '', avatarUrl: u.avatar_url }))
}

/**
 * Fetches forkers of a repository
 */
export const fetchForkers = async (owner: string, repo: string, limit = 96): Promise<User[]> => {
  interface GitHubFork {
    owner: {
      login: string
      avatar_url: string
    }
  }

  const endpoint = `/repos/${owner}/${repo}/forks?sort=newest&per_page=100`
  const forks = await fetchFromGitHub<GitHubFork[]>(endpoint, `Forkers of ${owner}/${repo}`)

  return forks.slice(0, limit).map((fork) => ({
    login: fork.owner.login,
    name: fork.owner.login,
    avatarUrl: fork.owner.avatar_url,
  }))
}

/**
 * Fallback function to fetch sponsors using external API
 */
const fallbackFetchSponsors = async (author: string): Promise<User[]> => {
  logger.debug('Using fallback sponsors API', { author })

  const response = await fetch(`https://github-sponsors.as93.workers.dev/${author}`)

  if (!response.ok) {
    throw new GitHubAPIError(
      `GitHub API returned a ${response.status} ${response.statusText || 'Unknown Error'}`,
      response.status,
      'fallback-sponsors'
    )
  }

  return response.json() as Promise<User[]>
}

/**
 * Fetches sponsors for a user using GraphQL API
 */
export const fetchSponsors = async (username: string, limit = 96): Promise<User[]> => {
  // Use fallback if no token is available
  if (!process.env.GITHUB_TOKEN) {
    return fallbackFetchSponsors(username)
  }

  const query = `
    query($username: String!, $limit: Int!) {
      user(login: $username) {
        sponsorshipsAsMaintainer(first: $limit) {
          edges {
            node {
              sponsorEntity {
                ... on User {
                  login
                  name
                  avatarUrl: avatarUrl(size: 100)
                }
                ... on Organization {
                  login
                  name
                  avatarUrl: avatarUrl(size: 100)
                }
              }
            }
          }
        }
      }
    }
  `

  interface SponsorEntity {
    login: string
    name: string
    avatarUrl: string
  }

  interface SponsorEdge {
    node: {
      sponsorEntity: SponsorEntity
    }
  }

  interface GraphQLResponse {
    data: {
      user: {
        sponsorshipsAsMaintainer: {
          edges: SponsorEdge[]
        }
      } | null
    }
  }

  try {
    const response = await fetchGraphQL<GraphQLResponse>(
      query,
      { username, limit },
      `Sponsors of ${username}`
    )

    if (!response.data.user) {
      throw new Error(`User ${username} not found or has no sponsors`)
    }

    return response.data.user.sponsorshipsAsMaintainer.edges.map((edge) => {
      const entity = edge.node.sponsorEntity
      return {
        login: entity.login || '',
        name: entity.name,
        avatarUrl: entity.avatarUrl,
      }
    })
  } catch (error) {
    // Try fallback if GraphQL fails
    if (error instanceof GitHubAPIError) {
      logger.warn('GraphQL sponsors request failed, trying fallback', { username })
      try {
        return await fallbackFetchSponsors(username)
      } catch (_fallbackError) {
        // Re-throw the original GitHub API error for consistency
        throw error
      }
    }
    throw error
  }
}

/**
 * Fetches watchers (subscribers) for a repository
 */
export const fetchWatchers = async (owner: string, repo: string, limit = 96): Promise<User[]> => {
  if (process.env.GITHUB_TOKEN) {
    try {
      const query = `
        query($owner: String!, $repo: String!, $limit: Int!) {
          repository(owner: $owner, name: $repo) {
            watchers(last: $limit) {
              nodes { login name avatarUrl(size: 100) }
            }
          }
        }
      `
      interface Res {
        data: { repository: { watchers: { nodes: GraphQLUserNode[] } } }
      }
      const res = await fetchGraphQL<Res>(
        query,
        { owner, repo, limit },
        `Watchers of ${owner}/${repo}`
      )
      return mapGraphQLNodes(res.data.repository?.watchers.nodes ?? []).reverse()
    } catch {
      logger.warn('GraphQL watchers request failed, falling back to REST', { owner, repo })
    }
  }

  const data = await fetchFromGitHub<{ login: string; name: string; avatar_url: string }[]>(
    `/repos/${owner}/${repo}/subscribers?per_page=100`,
    `Watchers of ${owner}/${repo}`
  )
  return [...data]
    .reverse()
    .slice(0, limit)
    .map((u) => ({ login: u.login, name: u.name || '', avatarUrl: u.avatar_url }))
}

/**
 * Fetches followers for a user
 */
export const fetchFollowers = async (username: string, limit = 96): Promise<User[]> => {
  if (process.env.GITHUB_TOKEN) {
    try {
      const query = `
        query($username: String!, $limit: Int!) {
          user(login: $username) {
            followers(last: $limit) {
              nodes { login name avatarUrl(size: 100) }
            }
          }
        }
      `
      interface Res {
        data: { user: { followers: { nodes: GraphQLUserNode[] } } }
      }
      const res = await fetchGraphQL<Res>(query, { username, limit }, `Followers of ${username}`)
      return mapGraphQLNodes(res.data.user?.followers.nodes ?? []).reverse()
    } catch {
      logger.warn('GraphQL followers request failed, falling back to REST', { username })
    }
  }

  const data = await fetchFromGitHub<{ login: string; name: string; avatar_url: string }[]>(
    `/users/${username}/followers?per_page=100`,
    `Followers of ${username}`
  )
  return [...data]
    .reverse()
    .slice(0, limit)
    .map((u) => ({ login: u.login, name: u.name || '', avatarUrl: u.avatar_url }))
}
