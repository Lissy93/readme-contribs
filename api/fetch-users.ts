import type { User } from './types'

export const fetchContributors = async (owner: string, repo: string, limit: number = 100): Promise<User[]> => {
  const headers: { Authorization?: string; } = {};

  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }

  const apiBase = 'https://api.github.com';
  const endpoint = `${apiBase}/repos/${owner}/${repo}/contributors?per_page=${limit}`;

  const response = await fetch(endpoint, { headers: headers });

  if (!response.ok) {
    throw new Error(`GitHub API returned a ${response.status} ${response.statusText || 'Unknown Error'}`);
  }

  return (await response.json()).map((user: any) => ({
    login: user.login,
    name: user.name,
    avatarUrl: user.avatar_url
  }));
}

export const fetchStargazers = async (owner: string, repo: string, limit: number = 100): Promise<User[]> => {
  const headers: { Authorization?: string; } = {};

  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }

  const apiBase = 'https://api.github.com';
  const endpoint = `${apiBase}/repos/${owner}/${repo}/stargazers?per_page=${limit}`;

  try {
    const response = await fetch(endpoint, { headers });
    if (!response.ok) {
      throw new Error(`GitHub API returned a ${response.status} ${response.statusText || 'Unknown Error'}`);
    }
    
    const stargazers = await response.json();
    return stargazers.map((user: any) => ({
      login: user.login,
      name: user.name || "",  // Not all user profiles have a "name" publicly available
      avatarUrl: user.avatar_url
    }));
  } catch (error) {
    console.error(`Error fetching stargazers: ${error}`);
    throw error;
  }
}

const fallbackFetchSponsors = async (author: string): Promise<User[]> => {
  const response = await fetch(`https://github-sponsors.as93.workers.dev/${author}`)
  if (!response.ok) {
    throw new Error(`GitHub API returned a ${response.status} ${response.statusText || 'Unknown Error'}`);
  }
  return await response.json()
}

export const fetchSponsors = async (username: string): Promise<User[]> => {
  if (!process.env.GITHUB_TOKEN) {
    return fallbackFetchSponsors(username);
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
  `;

  const headers = {
    'Authorization': `bearer ${process.env.GITHUB_TOKEN}`,
    'Content-Type': 'application/json',
    'User-Agent': 'GitHub GraphQL API'
  };

  try {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ query })
    });

    // If request failed, try using my REST API as a fallback
    if (!response.ok) {
      try {
        return fallbackFetchSponsors(username)
      } catch (fallbackError) {
        throw new Error(
          `Failed to fetch GitHub data with status ${response.status}; `
          + `Fallback also failed with ${fallbackError}`
        );
      }
    }

    const data = await response.json();
    if (!data.data.user) {
      throw new Error(`User ${username} not found or has no sponsors`);
    }
    return data.data.user.sponsorshipsAsMaintainer.edges.map((edge: { node: { sponsorEntity: any; }; }) => {
      const entity = edge.node.sponsorEntity;
      return {
        login: entity.login || null,
        name: entity.name,
        avatarUrl: entity.avatarUrl
      };
    });
  } catch (error) {
    throw new Error(`Failed to fetch sponsors: ${error};`);
  }
};
