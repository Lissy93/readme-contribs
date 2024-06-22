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

export const fetchSponsors = async (author: string): Promise<User[]> => {
  const response = await fetch(`https://github-sponsors.as93.workers.dev/${author}`)
  if (!response.ok) {
    throw new Error(`GitHub API returned a ${response.status} ${response.statusText || 'Unknown Error'}`);
  }
  return await response.json()
}
