import type { User } from './types'

// GitHub API response types
interface GitHubContributor {
  login: string
  name: string
  avatar_url: string
  contributions: number
}

interface GitHubUser {
  login: string
  name: string
  avatar_url: string
}

interface GitHubFork {
  owner: {
    login: string
    avatar_url: string
  }
}

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

export const fetchContributors = async (
  owner: string,
  repo: string,
  limit: number = 100
): Promise<User[]> => {
  const headers: { Authorization?: string } = {}

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_TOKEN}`
  }

  const apiBase = 'https://api.github.com'
  const endpoint = `${apiBase}/repos/${owner}/${repo}/contributors?per_page=${limit}`

  const response = await fetch(endpoint, { headers: headers })

  if (!response.ok) {
    throw new Error(
      `GitHub API returned a ${response.status} ${response.statusText || 'Unknown Error'}`
    )
  }

  const contributors = (await response.json()) as GitHubContributor[]
  return contributors.map((user) => ({
    login: user.login,
    name: user.name,
    avatarUrl: user.avatar_url,
  }))
}

export const fetchStargazers = async (
  owner: string,
  repo: string,
  limit: number = 100
): Promise<User[]> => {
  const headers: { Authorization?: string } = {}

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_TOKEN}`
  }

  const apiBase = 'https://api.github.com'
  const endpoint = `${apiBase}/repos/${owner}/${repo}/stargazers?per_page=${limit}`

  try {
    const response = await fetch(endpoint, { headers })
    if (!response.ok) {
      throw new Error(
        `GitHub API returned a ${response.status} ${response.statusText || 'Unknown Error'}`
      )
    }

    const stargazers = (await response.json()) as GitHubUser[]
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
 * Fetches forkers of a specific repository.
 * @param owner The username of the repository owner.
 * @param repo The repository name.
 * @param limit The maximum number of forkers to fetch (up to 100).
 * @returns An array of User objects representing the users who have forked the repository.
 */
export const fetchForkers = async (
  owner: string,
  repo: string,
  limit: number = 100
): Promise<User[]> => {
  const headers: { Authorization?: string } = {}

  // Use a GitHub token if available for higher rate limits and access to private repos
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_TOKEN}`
  }

  const apiBase = 'https://api.github.com'
  const endpoint = `${apiBase}/repos/${owner}/${repo}/forks?per_page=${limit}`

  const response = await fetch(endpoint, { headers })

  if (!response.ok) {
    throw new Error(
      `GitHub API returned a ${response.status} ${response.statusText || 'Unknown Error'}`
    )
  }

  const forks = (await response.json()) as GitHubFork[]
  return forks.map((fork) => ({
    login: fork.owner.login,
    name: fork.owner.login,
    avatarUrl: fork.owner.avatar_url,
  }))
}

const fallbackFetchSponsors = async (author: string): Promise<User[]> => {
  const response = await fetch(`https://github-sponsors.as93.workers.dev/${author}`)
  if (!response.ok) {
    throw new Error(
      `GitHub API returned a ${response.status} ${response.statusText || 'Unknown Error'}`
    )
  }
  return await response.json()
}

export const fetchSponsors = async (username: string): Promise<User[]> => {
  if (!process.env.GITHUB_TOKEN) {
    return fallbackFetchSponsors(username)
  }

  const query = `
    query {
      user(login: "${username}") {
        sponsorshipsAsMaintainer(first: 100) {
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

  const headers = {
    Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
    'Content-Type': 'application/json',
    'User-Agent': 'GitHub GraphQL API',
  }

  try {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ query }),
    })

    // If request failed, try using my REST API as a fallback
    if (!response.ok) {
      try {
        return fallbackFetchSponsors(username)
      } catch (fallbackError) {
        throw new Error(
          `Failed to fetch GitHub data with status ${response.status}; ` +
            `Fallback also failed with ${fallbackError}`
        )
      }
    }

    const data = await response.json()
    if (!data.data.user) {
      throw new Error(`User ${username} not found or has no sponsors`)
    }
    return data.data.user.sponsorshipsAsMaintainer.edges.map((edge: SponsorEdge) => {
      const entity = edge.node.sponsorEntity
      return {
        login: entity.login || null,
        name: entity.name,
        avatarUrl: entity.avatarUrl,
      }
    })
  } catch (error) {
    throw new Error(`Failed to fetch sponsors: ${error};`)
  }
}
