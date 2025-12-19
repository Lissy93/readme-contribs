import type { User } from '../../types'

// Mock user data factory
export const createMockUser = (overrides?: Partial<User>): User => ({
  login: 'testuser',
  name: 'Test User',
  avatarUrl: 'https://avatars.githubusercontent.com/u/123456',
  ...overrides,
})

export const mockUsers: User[] = [
  createMockUser({ login: 'alice', name: 'Alice Smith', avatarUrl: 'https://avatars.githubusercontent.com/u/1' }),
  createMockUser({ login: 'bob', name: 'Bob Jones', avatarUrl: 'https://avatars.githubusercontent.com/u/2' }),
  createMockUser({ login: 'charlie', name: 'Charlie Brown', avatarUrl: 'https://avatars.githubusercontent.com/u/3' }),
]

// Mock GitHub API responses
export const mockContributorsResponse = [
  { login: 'alice', name: 'Alice Smith', avatar_url: 'https://avatars.githubusercontent.com/u/1', contributions: 100 },
  { login: 'bob', name: 'Bob Jones', avatar_url: 'https://avatars.githubusercontent.com/u/2', contributions: 50 },
  { login: 'charlie', name: 'Charlie Brown', avatar_url: 'https://avatars.githubusercontent.com/u/3', contributions: 25 },
]

export const mockStargazersResponse = [
  { login: 'alice', name: 'Alice Smith', avatar_url: 'https://avatars.githubusercontent.com/u/1' },
  { login: 'bob', name: 'Bob Jones', avatar_url: 'https://avatars.githubusercontent.com/u/2' },
  { login: 'charlie', name: '', avatar_url: 'https://avatars.githubusercontent.com/u/3' },
]

export const mockForksResponse = [
  {
    owner: { login: 'alice', avatar_url: 'https://avatars.githubusercontent.com/u/1' },
    name: 'forked-repo',
  },
  {
    owner: { login: 'bob', avatar_url: 'https://avatars.githubusercontent.com/u/2' },
    name: 'forked-repo',
  },
]

export const mockSponsorsGraphQLResponse = {
  data: {
    user: {
      sponsorshipsAsMaintainer: {
        edges: [
          {
            node: {
              sponsorEntity: {
                login: 'sponsor1',
                name: 'Sponsor One',
                avatarUrl: 'https://avatars.githubusercontent.com/u/10',
              },
            },
          },
          {
            node: {
              sponsorEntity: {
                login: 'sponsor2',
                name: 'Sponsor Two',
                avatarUrl: 'https://avatars.githubusercontent.com/u/11',
              },
            },
          },
        ],
      },
    },
  },
}

export const mockSponsorsRESTResponse = [
  { login: 'sponsor1', name: 'Sponsor One', avatarUrl: 'https://avatars.githubusercontent.com/u/10' },
  { login: 'sponsor2', name: 'Sponsor Two', avatarUrl: 'https://avatars.githubusercontent.com/u/11' },
]

// Mock fetch responses
export const createMockResponse = (data: any, status = 200, statusText = 'OK') => ({
  ok: status >= 200 && status < 300,
  status,
  statusText,
  json: async () => data,
  headers: new Map([['content-type', 'application/json']]),
})

export const createMockImageResponse = (): any => {
  const buffer = new ArrayBuffer(100)

  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    arrayBuffer: () => Promise.resolve(buffer),
    headers: {
      get: (name: string) => (name.toLowerCase() === 'content-type' ? 'image/png' : null),
    },
  }
}

// Helper to create error responses
export const createErrorResponse = (status: number, statusText: string) =>
  createMockResponse({}, status, statusText)
