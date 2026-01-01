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
const fetchFromGitHub = async <T>(endpoint: string): Promise<T> => {
  const url = endpoint.startsWith('http') ? endpoint : `${GITHUB_API_BASE}${endpoint}`

  logger.debug('GitHub API request', { endpoint: url })

  const response = await fetch(url, { headers: getAuthHeaders() })

  if (!response.ok) {
    const error = new GitHubAPIError(
      `GitHub API returned a ${response.status} ${response.statusText || 'Unknown Error'}`,
      response.status,
      endpoint
    )
    throw error
  }

  return response.json() as Promise<T>
}

/**
 * Makes a GraphQL request to GitHub
 */
const fetchGraphQL = async <T>(query: string, variables?: Record<string, unknown>): Promise<T> => {
  logger.debug('GitHub GraphQL request')

  const response = await fetch(GITHUB_GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    throw new GitHubAPIError(`GitHub API returned a ${response.status}`, response.status, 'graphql')
  }

  return response.json() as Promise<T>
}

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

  const endpoint = `/repos/${owner}/${repo}/contributors?per_page=${limit}`
  const contributors = await fetchFromGitHub<GitHubContributor[]>(endpoint)

  return contributors.map((user) => ({
    login: user.login,
    name: user.name,
    avatarUrl: user.avatar_url,
  }))
}

/**
 * Fetches stargazers for a repository
 */
export const fetchStargazers = async (owner: string, repo: string, limit = 96): Promise<User[]> => {
  interface GitHubUser {
    login: string
    name: string
    avatar_url: string
  }

  try {
    const endpoint = `/repos/${owner}/${repo}/stargazers?per_page=${limit}`
    const stargazers = await fetchFromGitHub<GitHubUser[]>(endpoint)

    return stargazers.map((user) => ({
      login: user.login,
      name: user.name || '',
      avatarUrl: user.avatar_url,
    }))
  } catch (error) {
    console.error(`Error fetching stargazers: ${error}`)
    throw error
  }
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

  const endpoint = `/repos/${owner}/${repo}/forks?per_page=${limit}`
  const forks = await fetchFromGitHub<GitHubFork[]>(endpoint)

  return forks.map((fork) => ({
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

  return response.json()
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
    const response = await fetchGraphQL<GraphQLResponse>(query, { username, limit })

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
  interface GitHubUser {
    login: string
    name: string
    avatar_url: string
  }

  try {
    const endpoint = `/repos/${owner}/${repo}/subscribers?per_page=${limit}`
    const watchers = await fetchFromGitHub<GitHubUser[]>(endpoint)

    return watchers.map((user) => ({
      login: user.login,
      name: user.name || '',
      avatarUrl: user.avatar_url,
    }))
  } catch (error) {
    console.error(`Error fetching watchers: ${error}`)
    throw error
  }
}

/**
 * Fetches followers for a user
 */
export const fetchFollowers = async (username: string, limit = 96): Promise<User[]> => {
  interface GitHubUser {
    login: string
    name: string
    avatar_url: string
  }

  try {
    const endpoint = `/users/${username}/followers?per_page=${limit}`
    const followers = await fetchFromGitHub<GitHubUser[]>(endpoint)

    return followers.map((user) => ({
      login: user.login,
      name: user.name || '',
      avatarUrl: user.avatar_url,
    }))
  } catch (error) {
    console.error(`Error fetching followers: ${error}`)
    throw error
  }
}
