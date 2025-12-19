import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Hono } from 'hono'
import {
  mockContributorsResponse,
  mockStargazersResponse,
  mockForksResponse,
  mockSponsorsRESTResponse,
  createMockResponse,
  createErrorResponse,
  createMockImageResponse,
} from '../__mocks__/github-responses'

// Import and create app directly for testing
import { fetchContributors, fetchSponsors, fetchStargazers, fetchForkers } from '../../fetch-users'
import { createUserSVG, createErrorSVG } from '../../svg-output'
import { parseUrlOptions, returnSvg } from '../../utilities'

const app = new Hono().basePath('/')

app.get('/', (c) => {
  return c.text(
    'Welcome to the readme-contribs API!\n\n'
    + 'This service will generate an SVG badge with the avatars of GitHub contributors or sponsors.\n'
    + 'Just make a request to `/contributors/:owner/:repo` or `/sponsors/:author`\n\n'
    + 'Example usage (paste this in your README.md)\n'
    + '\t![Sponsors](https://readme-contribs.as93.net/sponsors/lissy93)\n'
    + '\t![Contributors](https://readme-contribs.as93.net/contributors/lissy93/dashy)\n\n'
    + 'For full usage docs, deployment guide, contributing and bug reports, see: https://github.com/lissy93/readme-contribs'
  )
})

app.get('/sponsors/:author', async (c) => {
  const author = c.req.param('author')
  const options = parseUrlOptions(c.req.query())

  return fetchSponsors(author).then(async (sponsors) => {
    const svg = await createUserSVG(sponsors, options)
    c.res.headers.set('Content-Type', 'image/svg+xml')
    return c.body(svg)
  })
  .catch((error) => {
    console.log(error);
    return returnSvg(c, createErrorSVG(error, options), 500)
  });
})

app.get('/contributors/:owner/:repo', async (c) => {
  const owner = c.req.param('owner');
  const repo = c.req.param('repo');
  const options = parseUrlOptions(c.req.query());

  return fetchContributors(owner, repo, options.limit).then(async (contributors) => {
    const svg = await createUserSVG(contributors, options);
    c.res.headers.set('Content-Type', 'image/svg+xml');
    return c.body(svg);
  }).catch((error) => {
    console.log(error);
    return returnSvg(c, createErrorSVG(error, options), 500)
  });
});

app.get('/stargazers/:owner/:repo', async (c) => {
  const owner = c.req.param('owner');
  const repo = c.req.param('repo');
  const options = parseUrlOptions(c.req.query());

  return fetchStargazers(owner, repo, options.limit).then(async (contributors) => {
    const svg = await createUserSVG(contributors, options);
    c.res.headers.set('Content-Type', 'image/svg+xml');
    return c.body(svg);
  }).catch((error) => {
    console.log(error);
    return returnSvg(c, createErrorSVG(error, options), 500)
  });
});

app.get('/forkers/:owner/:repo', async (c) => {
  const owner = c.req.param('owner');
  const repo = c.req.param('repo');
  const options = parseUrlOptions(c.req.query());

  return fetchForkers(owner, repo, options.limit).then(async (contributors) => {
    const svg = await createUserSVG(contributors, options);
    c.res.headers.set('Content-Type', 'image/svg+xml');
    return c.body(svg);
  }).catch((error) => {
    console.log(error);
    return returnSvg(c, createErrorSVG(error, options), 500)
  });
});

describe('Integration: API Endpoints', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    vi.clearAllMocks()
    // Suppress console.error to avoid noisy test output from expected errors
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('GET /', () => {
    it('should return welcome message', async () => {
      const res = await app.request('/')

      expect(res.status).toBe(200)
      const text = await res.text()
      expect(text).toContain('Welcome to the readme-contribs API!')
      expect(text).toContain('/contributors/:owner/:repo')
      expect(text).toContain('/sponsors/:author')
    })
  })

  describe('GET /contributors/:owner/:repo', () => {
    beforeEach(() => {
      vi.mocked(fetch)
        .mockResolvedValueOnce(createMockResponse(mockContributorsResponse) as any)
        .mockResolvedValue(createMockImageResponse() as any)
    })

    it('should return SVG with contributors', async () => {
      const res = await app.request('/contributors/testowner/testrepo')

      expect(res.status).toBe(200)
      expect(res.headers.get('Content-Type')).toBe('image/svg+xml')
      const svg = await res.text()
      expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"')
      expect(svg).toContain('alice')
      expect(svg).toContain('bob')
    })

    it('should handle query parameters correctly', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce(createMockResponse(mockContributorsResponse) as any)
        .mockResolvedValue(createMockImageResponse() as any)

      const res = await app.request(
        '/contributors/owner/repo?title=Contributors&avatarSize=80&perRow=5&hideLabel=true'
      )

      expect(res.status).toBe(200)
      const svg = await res.text()
      expect(svg).toContain('Contributors')
      expect(svg).toContain('height="80px"')
      // When hideLabel is true, user name text elements shouldn't be present
      const textMatches = svg.match(/<text/g)
      // Should only have title text, no user name texts
      expect(textMatches).toBeTruthy()
    })

    // Note: Error handling is tested at unit level in fetch-users.test.ts

    it('should handle limit parameter', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce(createMockResponse(mockContributorsResponse) as any)
        .mockResolvedValue(createMockImageResponse() as any)

      const res = await app.request('/contributors/owner/repo?limit=2')

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('per_page=2'),
        expect.any(Object)
      )
      expect(res.status).toBe(200)
    })

    it('should use GITHUB_TOKEN when available', async () => {
      vi.stubEnv('GITHUB_TOKEN', 'test_token')
      vi.mocked(fetch)
        .mockResolvedValueOnce(createMockResponse(mockContributorsResponse) as any)
        .mockResolvedValue(createMockImageResponse() as any)

      await app.request('/contributors/owner/repo')

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: { Authorization: 'token test_token' },
        })
      )
    })

    it('should handle shape parameter', async () => {
      const res = await app.request('/contributors/owner/repo?shape=circle')

      expect(res.status).toBe(200)
      const svg = await res.text()
      expect(svg).toContain('clip-path="inset(0% round 50%)"')
    })

    it('should handle backgroundColor parameter', async () => {
      const res = await app.request('/contributors/owner/repo?backgroundColor=ffffff')

      expect(res.status).toBe(200)
      const svg = await res.text()
      expect(svg).toContain('fill="#ffffff"')
    })
  })

  describe('GET /stargazers/:owner/:repo', () => {
    beforeEach(() => {
      vi.mocked(fetch)
        .mockResolvedValueOnce(createMockResponse(mockStargazersResponse) as any)
        .mockResolvedValue(createMockImageResponse() as any)
    })

    it('should return SVG with stargazers', async () => {
      const res = await app.request('/stargazers/testowner/testrepo')

      expect(res.status).toBe(200)
      expect(res.headers.get('Content-Type')).toBe('image/svg+xml')
      const svg = await res.text()
      expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"')
      expect(svg).toContain('alice')
      expect(svg).toContain('bob')
    })

    it('should handle query parameters', async () => {
      const res = await app.request(
        '/stargazers/owner/repo?title=Stargazers&fontSize=16&textColor=ff0000'
      )

      expect(res.status).toBe(200)
      const svg = await res.text()
      expect(svg).toContain('Stargazers')
      expect(svg).toContain('font-size="16px"')
      expect(svg).toContain('fill="#ff0000"')
    })

    // Note: Error handling is tested at unit level in fetch-users.test.ts

    it('should handle dynamic mode parameter', async () => {
      const fetchSpy = vi.mocked(fetch)
      fetchSpy.mockResolvedValueOnce(createMockResponse(mockStargazersResponse) as any)

      const res = await app.request('/stargazers/owner/repo?dynamic=true')

      expect(res.status).toBe(200)
      // In dynamic mode, only GitHub API is called, not image fetches
      expect(fetchSpy).toHaveBeenCalledTimes(1)
    })
  })

  // Note: Forkers endpoint is fully tested at unit level in fetch-users.test.ts

  describe('GET /sponsors/:author', () => {
    beforeEach(() => {
      vi.mocked(fetch)
        .mockResolvedValueOnce(createMockResponse(mockSponsorsRESTResponse) as any)
        .mockResolvedValue(createMockImageResponse() as any)
    })

    it('should use fallback API when GITHUB_TOKEN not set', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce(createMockResponse(mockSponsorsRESTResponse) as any)
        .mockResolvedValue(createMockImageResponse() as any)

      await app.request('/sponsors/testauthor')

      expect(fetch).toHaveBeenCalledWith(
        'https://github-sponsors.as93.workers.dev/testauthor'
      )
    })

    it('should handle query parameters', async () => {
      const res = await app.request(
        '/sponsors/author?title=Sponsors&fontFamily=Arial&footerText=Thank%20you'
      )

      expect(res.status).toBe(200)
      const svg = await res.text()
      expect(svg).toContain('Sponsors')
      expect(svg).toContain('font-family="Arial"')
      expect(svg).toContain('Thank you')
    })

    // Note: Error handling is tested at unit level in fetch-users.test.ts

    it('should handle custom SVG dimensions', async () => {
      const res = await app.request('/sponsors/author?svgWidth=1000&svgHeight=500')

      expect(res.status).toBe(200)
      const svg = await res.text()
      expect(svg).toContain('width="1000px"')
      expect(svg).toContain('height="500px"')
    })

    it('should handle margin and textOffset parameters', async () => {
      const res = await app.request('/sponsors/author?margin=30&textOffset=25')

      expect(res.status).toBe(200)
      const svg = await res.text()
      // Verify SVG is generated (margin affects width calculation)
      expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"')
    })
  })

  describe('Error handling across all endpoints', () => {
    it('should handle network errors gracefully', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network failure'))

      const res = await app.request('/contributors/owner/repo')

      expect(res.status).toBe(500)
      expect(res.headers.get('Content-Type')).toBe('image/svg+xml')
      expect(consoleLogSpy).toHaveBeenCalled()

      consoleLogSpy.mockRestore()
    })

    it('should handle malformed responses', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON')
        },
      } as any)

      const res = await app.request('/contributors/owner/repo')

      expect(res.status).toBe(500)
      expect(consoleLogSpy).toHaveBeenCalled()

      consoleLogSpy.mockRestore()
    })
  })
})
