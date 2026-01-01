import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  fetchContributors,
  fetchFollowers,
  fetchForkers,
  fetchSponsors,
  fetchStargazers,
  fetchWatchers,
} from '../fetch-users'
import {
  createErrorResponse,
  createMockResponse,
  mockContributorsResponse,
  mockFollowersResponse,
  mockForksResponse,
  mockSponsorsGraphQLResponse,
  mockSponsorsRESTResponse,
  mockStargazersResponse,
  mockWatchersResponse,
} from './__mocks__/github-responses'

describe('fetchContributors', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  it('should fetch contributors successfully', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(mockContributorsResponse))

    const result = await fetchContributors('testowner', 'testrepo')

    expect(fetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/testowner/testrepo/contributors?per_page=96',
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
    vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(mockContributorsResponse))

    await fetchContributors('testowner', 'testrepo')

    expect(fetch).toHaveBeenCalledWith(expect.any(String), {
      headers: { Authorization: 'token test_token_123' },
    })
  })

  it('should respect custom limit parameter', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(mockContributorsResponse))

    await fetchContributors('testowner', 'testrepo', 50)

    expect(fetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/testowner/testrepo/contributors?per_page=50',
      expect.any(Object)
    )
  })

  it('should throw error when API returns 404', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(createErrorResponse(404, 'Not Found'))

    await expect(fetchContributors('invalid', 'repo')).rejects.toThrow(
      'GitHub API returned a 404 Not Found'
    )
  })

  it('should throw error when API returns 403', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(createErrorResponse(403, 'Forbidden'))

    await expect(fetchContributors('owner', 'repo')).rejects.toThrow(
      'GitHub API returned a 403 Forbidden'
    )
  })

  it('should handle empty contributors array', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(createMockResponse([]))

    const result = await fetchContributors('owner', 'repo')
    expect(result).toEqual([])
  })
})

describe('fetchStargazers', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  it('should fetch stargazers successfully', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(mockStargazersResponse))

    const result = await fetchStargazers('testowner', 'testrepo')

    expect(fetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/testowner/testrepo/stargazers?per_page=96',
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
    vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(mockStargazersResponse))

    const result = await fetchStargazers('owner', 'repo')

    // Third user has empty name
    expect(result[2].name).toBe('')
  })

  it('should include Authorization header when GITHUB_TOKEN is set', async () => {
    vi.stubEnv('GITHUB_TOKEN', 'test_token_456')
    vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(mockStargazersResponse))

    await fetchStargazers('owner', 'repo')

    expect(fetch).toHaveBeenCalledWith(expect.any(String), {
      headers: { Authorization: 'token test_token_456' },
    })
  })

  it('should throw and log error on API failure', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(fetch).mockResolvedValueOnce(createErrorResponse(500, 'Internal Server Error'))

    await expect(fetchStargazers('owner', 'repo')).rejects.toThrow(
      'GitHub API returned a 500 Internal Server Error'
    )
    expect(consoleErrorSpy).toHaveBeenCalled()

    consoleErrorSpy.mockRestore()
  })

  it('should respect custom limit parameter', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(mockStargazersResponse))

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
    vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(mockForksResponse))

    const result = await fetchForkers('testowner', 'testrepo')

    expect(fetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/testowner/testrepo/forks?per_page=96',
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
    vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(mockForksResponse))

    const result = await fetchForkers('owner', 'repo')

    // Verify that login is used for both login and name
    expect(result[0].login).toBe(result[0].name)
    expect(result[1].login).toBe(result[1].name)
  })

  it('should include Authorization header when GITHUB_TOKEN is set', async () => {
    vi.stubEnv('GITHUB_TOKEN', 'test_token_789')
    vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(mockForksResponse))

    await fetchForkers('owner', 'repo')

    expect(fetch).toHaveBeenCalledWith(expect.any(String), {
      headers: { Authorization: 'token test_token_789' },
    })
  })

  it('should throw error when API returns error status', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(createErrorResponse(404, 'Not Found'))

    await expect(fetchForkers('invalid', 'repo')).rejects.toThrow(
      'GitHub API returned a 404 Not Found'
    )
  })

  it('should respect custom limit parameter', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(mockForksResponse))

    await fetchForkers('owner', 'repo', 10)

    expect(fetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/owner/repo/forks?per_page=10',
      expect.any(Object)
    )
  })
})

describe('fetchWatchers', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  it('should fetch watchers successfully', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(mockWatchersResponse))

    const result = await fetchWatchers('testowner', 'testrepo')

    expect(fetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/testowner/testrepo/subscribers?per_page=96',
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
    vi.stubEnv('GITHUB_TOKEN', 'test_token_watchers')
    vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(mockWatchersResponse))

    await fetchWatchers('owner', 'repo')

    expect(fetch).toHaveBeenCalledWith(expect.any(String), {
      headers: { Authorization: 'token test_token_watchers' },
    })
  })

  it('should handle empty name field', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(mockWatchersResponse))

    const result = await fetchWatchers('owner', 'repo')

    // charlie has empty name in mock
    expect(result[2].name).toBe('')
  })

  it('should throw and log error on API failure', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(fetch).mockResolvedValueOnce(createErrorResponse(404, 'Not Found'))

    await expect(fetchWatchers('invalid', 'repo')).rejects.toThrow(
      'GitHub API returned a 404 Not Found'
    )
    expect(consoleErrorSpy).toHaveBeenCalled()

    consoleErrorSpy.mockRestore()
  })

  it('should respect custom limit parameter', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(mockWatchersResponse))

    await fetchWatchers('owner', 'repo', 30)

    expect(fetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/owner/repo/subscribers?per_page=30',
      expect.any(Object)
    )
  })
})

describe('fetchFollowers', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  it('should fetch followers successfully', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(mockFollowersResponse))

    const result = await fetchFollowers('testuser')

    expect(fetch).toHaveBeenCalledWith(
      'https://api.github.com/users/testuser/followers?per_page=96',
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
    vi.stubEnv('GITHUB_TOKEN', 'test_token_followers')
    vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(mockFollowersResponse))

    await fetchFollowers('testuser')

    expect(fetch).toHaveBeenCalledWith(expect.any(String), {
      headers: { Authorization: 'token test_token_followers' },
    })
  })

  it('should throw and log error on API failure', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(fetch).mockResolvedValueOnce(createErrorResponse(404, 'Not Found'))

    await expect(fetchFollowers('invaliduser')).rejects.toThrow(
      'GitHub API returned a 404 Not Found'
    )
    expect(consoleErrorSpy).toHaveBeenCalled()

    consoleErrorSpy.mockRestore()
  })

  it('should respect custom limit parameter', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(mockFollowersResponse))

    await fetchFollowers('testuser', 50)

    expect(fetch).toHaveBeenCalledWith(
      'https://api.github.com/users/testuser/followers?per_page=50',
      expect.any(Object)
    )
  })

  it('should handle empty followers array', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(createMockResponse([]))

    const result = await fetchFollowers('user')
    expect(result).toEqual([])
  })
})

describe('fetchSponsors', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  it('should use fallback API when GITHUB_TOKEN is not set', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(mockSponsorsRESTResponse))

    const result = await fetchSponsors('testuser')

    expect(fetch).toHaveBeenCalledWith('https://github-sponsors.as93.workers.dev/testuser')
    expect(result).toEqual(mockSponsorsRESTResponse)
  })

  it('should fetch sponsors via GraphQL when GITHUB_TOKEN is set', async () => {
    vi.stubEnv('GITHUB_TOKEN', 'test_token_graphql')
    vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(mockSponsorsGraphQLResponse))

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
      .mockResolvedValueOnce(createErrorResponse(401, 'Unauthorized'))
      .mockResolvedValueOnce(createMockResponse(mockSponsorsRESTResponse))

    const result = await fetchSponsors('testuser')

    // Verify both calls were made
    expect(fetch).toHaveBeenNthCalledWith(1, 'https://api.github.com/graphql', expect.any(Object))
    expect(fetch).toHaveBeenNthCalledWith(2, 'https://github-sponsors.as93.workers.dev/testuser')
    expect(result).toEqual(mockSponsorsRESTResponse)
  })

  it('should throw error when user not found', async () => {
    vi.stubEnv('GITHUB_TOKEN', 'test_token')
    vi.mocked(fetch).mockResolvedValueOnce(createMockResponse({ data: { user: null } }))

    await expect(fetchSponsors('nonexistent')).rejects.toThrow(
      'User nonexistent not found or has no sponsors'
    )
  })

  it('should throw error when both GraphQL and fallback fail', async () => {
    vi.stubEnv('GITHUB_TOKEN', 'test_token')
    vi.clearAllMocks()
    vi.mocked(fetch)
      .mockResolvedValueOnce(createErrorResponse(500, 'Server Error'))
      .mockResolvedValueOnce(createErrorResponse(500, 'Server Error'))

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
    vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(orgSponsorResponse))

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
    vi.mocked(fetch).mockResolvedValueOnce(createErrorResponse(404, 'Not Found'))

    await expect(fetchSponsors('testuser')).rejects.toThrow('GitHub API returned a 404 Not Found')
  })
})
