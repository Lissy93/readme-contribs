import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchContributors, fetchForkers, fetchSponsors, fetchStargazers } from '../fetch-users'
import {
  createErrorResponse,
  createMockResponse,
  mockContributorsResponse,
  mockForksResponse,
  mockSponsorsGraphQLResponse,
  mockSponsorsRESTResponse,
  mockStargazersResponse,
} from './__mocks__/github-responses'

describe('fetchContributors', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  it('should fetch contributors successfully', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(mockContributorsResponse) as any)

    const result = await fetchContributors('testowner', 'testrepo')

    expect(fetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/testowner/testrepo/contributors?per_page=100',
      { headers: {} }
    )
    expect(result).toHaveLength(3)
    expect(result[0]).toEqual({
      login: 'alice',
      name: 'Alice Smith',
      avatarUrl: 'https://avatars.githubusercontent.com/u/1',
    })
  })

  it('should include Authorization header when GITHUB_TOKEN is set', async () => {
    vi.stubEnv('GITHUB_TOKEN', 'test_token_123')
    vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(mockContributorsResponse) as any)

    await fetchContributors('testowner', 'testrepo')

    expect(fetch).toHaveBeenCalledWith(expect.any(String), {
      headers: { Authorization: 'token test_token_123' },
    })
  })

  it('should respect custom limit parameter', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(mockContributorsResponse) as any)

    await fetchContributors('testowner', 'testrepo', 50)

    expect(fetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/testowner/testrepo/contributors?per_page=50',
      expect.any(Object)
    )
  })

  it('should throw error when API returns 404', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(createErrorResponse(404, 'Not Found') as any)

    await expect(fetchContributors('invalid', 'repo')).rejects.toThrow(
      'GitHub API returned a 404 Not Found'
    )
  })

  it('should throw error when API returns 403', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(createErrorResponse(403, 'Forbidden') as any)

    await expect(fetchContributors('owner', 'repo')).rejects.toThrow(
      'GitHub API returned a 403 Forbidden'
    )
  })

  it('should handle empty contributors array', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(createMockResponse([]) as any)

    const result = await fetchContributors('owner', 'repo')
    expect(result).toEqual([])
  })
})

describe('fetchStargazers', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  it('should fetch stargazers successfully', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(mockStargazersResponse) as any)

    const result = await fetchStargazers('testowner', 'testrepo')

    expect(fetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/testowner/testrepo/stargazers?per_page=100',
      { headers: {} }
    )
    expect(result).toHaveLength(3)
    expect(result[0]).toEqual({
      login: 'alice',
      name: 'Alice Smith',
      avatarUrl: 'https://avatars.githubusercontent.com/u/1',
    })
  })

  it('should handle stargazers with missing name field', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(mockStargazersResponse) as any)

    const result = await fetchStargazers('owner', 'repo')

    // Third user has empty name
    expect(result[2].name).toBe('')
  })

  it('should include Authorization header when GITHUB_TOKEN is set', async () => {
    vi.stubEnv('GITHUB_TOKEN', 'test_token_456')
    vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(mockStargazersResponse) as any)

    await fetchStargazers('owner', 'repo')

    expect(fetch).toHaveBeenCalledWith(expect.any(String), {
      headers: { Authorization: 'token test_token_456' },
    })
  })

  it('should throw and log error on API failure', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(fetch).mockResolvedValueOnce(createErrorResponse(500, 'Internal Server Error') as any)

    await expect(fetchStargazers('owner', 'repo')).rejects.toThrow(
      'GitHub API returned a 500 Internal Server Error'
    )
    expect(consoleErrorSpy).toHaveBeenCalled()

    consoleErrorSpy.mockRestore()
  })

  it('should respect custom limit parameter', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(mockStargazersResponse) as any)

    await fetchStargazers('owner', 'repo', 25)

    expect(fetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/owner/repo/stargazers?per_page=25',
      expect.any(Object)
    )
  })
})

describe('fetchForkers', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  it('should fetch forkers successfully', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(mockForksResponse) as any)

    const result = await fetchForkers('testowner', 'testrepo')

    expect(fetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/testowner/testrepo/forks?per_page=100',
      { headers: {} }
    )
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      login: 'alice',
      name: 'alice',
      avatarUrl: 'https://avatars.githubusercontent.com/u/1',
    })
  })

  it('should map fork owner data correctly', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(mockForksResponse) as any)

    const result = await fetchForkers('owner', 'repo')

    // Verify that login is used for both login and name
    expect(result[0].login).toBe(result[0].name)
    expect(result[1].login).toBe(result[1].name)
  })

  it('should include Authorization header when GITHUB_TOKEN is set', async () => {
    vi.stubEnv('GITHUB_TOKEN', 'test_token_789')
    vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(mockForksResponse) as any)

    await fetchForkers('owner', 'repo')

    expect(fetch).toHaveBeenCalledWith(expect.any(String), {
      headers: { Authorization: 'token test_token_789' },
    })
  })

  it('should throw error when API returns error status', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(createErrorResponse(404, 'Not Found') as any)

    await expect(fetchForkers('invalid', 'repo')).rejects.toThrow(
      'GitHub API returned a 404 Not Found'
    )
  })

  it('should respect custom limit parameter', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(mockForksResponse) as any)

    await fetchForkers('owner', 'repo', 10)

    expect(fetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/owner/repo/forks?per_page=10',
      expect.any(Object)
    )
  })
})

describe('fetchSponsors', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  it('should use fallback API when GITHUB_TOKEN is not set', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(mockSponsorsRESTResponse) as any)

    const result = await fetchSponsors('testuser')

    expect(fetch).toHaveBeenCalledWith('https://github-sponsors.as93.workers.dev/testuser')
    expect(result).toEqual(mockSponsorsRESTResponse)
  })

  it('should fetch sponsors via GraphQL when GITHUB_TOKEN is set', async () => {
    vi.stubEnv('GITHUB_TOKEN', 'test_token_graphql')
    vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(mockSponsorsGraphQLResponse) as any)

    const result = await fetchSponsors('testuser')

    expect(fetch).toHaveBeenCalledWith(
      'https://api.github.com/graphql',
      expect.objectContaining({
        method: 'POST',
        headers: {
          Authorization: 'bearer test_token_graphql',
          'Content-Type': 'application/json',
          'User-Agent': 'GitHub GraphQL API',
        },
      })
    )
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      login: 'sponsor1',
      name: 'Sponsor One',
      avatarUrl: 'https://avatars.githubusercontent.com/u/10',
    })
  })

  it('should fallback to REST API when GraphQL fails', async () => {
    vi.stubEnv('GITHUB_TOKEN', 'test_token_graphql')
    vi.clearAllMocks()
    vi.mocked(fetch)
      .mockResolvedValueOnce(createErrorResponse(401, 'Unauthorized') as any)
      .mockResolvedValueOnce(createMockResponse(mockSponsorsRESTResponse) as any)

    const result = await fetchSponsors('testuser')

    // Verify both calls were made
    expect(fetch).toHaveBeenNthCalledWith(1, 'https://api.github.com/graphql', expect.any(Object))
    expect(fetch).toHaveBeenNthCalledWith(2, 'https://github-sponsors.as93.workers.dev/testuser')
    expect(result).toEqual(mockSponsorsRESTResponse)
  })

  it('should throw error when user not found', async () => {
    vi.stubEnv('GITHUB_TOKEN', 'test_token')
    vi.mocked(fetch).mockResolvedValueOnce(createMockResponse({ data: { user: null } }) as any)

    await expect(fetchSponsors('nonexistent')).rejects.toThrow(
      'User nonexistent not found or has no sponsors'
    )
  })

  it('should throw error when both GraphQL and fallback fail', async () => {
    vi.stubEnv('GITHUB_TOKEN', 'test_token')
    vi.clearAllMocks()
    vi.mocked(fetch)
      .mockResolvedValueOnce(createErrorResponse(500, 'Server Error') as any)
      .mockResolvedValueOnce(createErrorResponse(500, 'Server Error') as any)

    await expect(fetchSponsors('testuser')).rejects.toThrow(/GitHub API returned a 500/)
  })

  it('should handle Organization sponsors correctly', async () => {
    vi.stubEnv('GITHUB_TOKEN', 'test_token')
    const orgSponsorResponse = {
      data: {
        user: {
          sponsorshipsAsMaintainer: {
            edges: [
              {
                node: {
                  sponsorEntity: {
                    login: 'acme-corp',
                    name: 'ACME Corporation',
                    avatarUrl: 'https://avatars.githubusercontent.com/u/999',
                  },
                },
              },
            ],
          },
        },
      },
    }
    vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(orgSponsorResponse) as any)

    const result = await fetchSponsors('testuser')

    expect(result).toEqual([
      {
        login: 'acme-corp',
        name: 'ACME Corporation',
        avatarUrl: 'https://avatars.githubusercontent.com/u/999',
      },
    ])
  })

  it('should throw error on fallback API failure when no token', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(createErrorResponse(404, 'Not Found') as any)

    await expect(fetchSponsors('testuser')).rejects.toThrow('GitHub API returned a 404 Not Found')
  })
})
