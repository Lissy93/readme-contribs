import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createUserSVG, createErrorSVG } from '../svg-output'
import { mockUsers, createMockImageResponse } from './__mocks__/github-responses'
import type { SvgOptions } from '../types'

const defaultOptions: SvgOptions = {
  title: '',
  avatarSize: 50,
  perRow: 8,
  shape: 'square',
  hideLabel: false,
  fontSize: 12,
  fontFamily: 'Arial',
  textColor: '333333',
  backgroundColor: 'transparent',
  limit: 100,
  outerBorderWidth: 0,
  outerBorderColor: '',
  outerBorderRadius: 0,
  margin: 20,
  textOffset: 20,
  svgWidth: 0,
  svgHeight: 0,
  footerText: '',
  dynamic: false,
  isResponsive: false,
}

describe('createErrorSVG', () => {
  it('should create an error SVG with the error message', () => {
    const svg = createErrorSVG('Test Error Message', defaultOptions)

    expect(svg).toContain('Test Error Message')
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"')
    expect(svg).toContain('fill="#ff4d4f"') // Error color
  })

  it('should use provided background color', () => {
    const options = { ...defaultOptions, backgroundColor: '#ffffff' }
    const svg = createErrorSVG('Error', options)

    expect(svg).toContain('fill="#ffffff"')
  })

  it('should use provided font family', () => {
    const options = { ...defaultOptions, fontFamily: 'Courier New' }
    const svg = createErrorSVG('Error', options)

    expect(svg).toContain('font-family="Courier New"')
  })

  it('should use provided font size', () => {
    const options = { ...defaultOptions, fontSize: 20 }
    const svg = createErrorSVG('Error', options)

    expect(svg).toContain('font-size="20"')
  })
})

describe('createUserSVG', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    vi.mocked(fetch).mockResolvedValue(createMockImageResponse() as any)
  })

  it('should create SVG with user avatars', async () => {
    const svg = await createUserSVG(mockUsers, defaultOptions)

    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"')
    expect(svg).toContain('alice') // login names are in GitHub links
    expect(svg).toContain('bob')
    expect(svg).toContain('charlie')
  })

  it('should include user profile links', async () => {
    const svg = await createUserSVG(mockUsers, defaultOptions)

    expect(svg).toContain('https://github.com/alice')
    expect(svg).toContain('https://github.com/bob')
    expect(svg).toContain('https://github.com/charlie')
  })

  it('should respect limit option', async () => {
    const options = { ...defaultOptions, limit: 2 }
    const svg = await createUserSVG(mockUsers, options)

    expect(svg).toContain('alice')
    expect(svg).toContain('bob')
    expect(svg).not.toContain('charlie')
  })

  it('should hide labels when hideLabel is true', async () => {
    const options = { ...defaultOptions, hideLabel: true }
    const svg = await createUserSVG(mockUsers, options)

    expect(svg).not.toContain('Alice Smith')
    expect(svg).not.toContain('Bob Jones')
  })

  it('should include title when provided', async () => {
    const options = { ...defaultOptions, title: 'Amazing Contributors' }
    const svg = await createUserSVG(mockUsers, options)

    expect(svg).toContain('Amazing Contributors')
  })

  it('should escape XML special characters in names', async () => {
    const specialUsers = [
      { login: 'user1', name: 'A&B', avatarUrl: 'https://example.com/1' },
      { login: 'user2', name: '<hi>', avatarUrl: 'https://example.com/2' },
      { login: 'user3', name: '"quote"', avatarUrl: 'https://example.com/3' },
    ]
    const options = { ...defaultOptions, avatarSize: 100 } // Larger size to avoid truncation
    const svg = await createUserSVG(specialUsers, options)

    // Names should be escaped
    expect(svg).toContain('A&amp;B')
    expect(svg).toContain('&lt;hi&gt;')
    expect(svg).toContain('&quot;quote&quot;')
  })

  it('should use login when name is missing', async () => {
    const users = [
      { login: 'testuser', name: '', avatarUrl: 'https://example.com/1' },
    ]
    const svg = await createUserSVG(users, defaultOptions)

    expect(svg).toContain('testuser')
  })

  it('should truncate long names with ellipsis', async () => {
    const users = [
      {
        login: 'user',
        name: 'This is a very long name that should be truncated',
        avatarUrl: 'https://example.com/1',
      },
    ]
    const svg = await createUserSVG(users, defaultOptions)

    expect(svg).toContain('…')
  })

  it('should apply circle shape with correct clip-path', async () => {
    const options = { ...defaultOptions, shape: 'circle' as const }
    const svg = await createUserSVG(mockUsers, options)

    expect(svg).toContain('clip-path="inset(0% round 50%)"')
  })

  it('should apply squircle shape with correct clip-path', async () => {
    const options = { ...defaultOptions, shape: 'squircle' as const }
    const svg = await createUserSVG(mockUsers, options)

    expect(svg).toContain('clip-path="inset(0% round 25%)"')
  })

  it('should apply square shape with correct clip-path', async () => {
    const options = { ...defaultOptions, shape: 'square' as const }
    const svg = await createUserSVG(mockUsers, options)

    expect(svg).toContain('clip-path="inset(0% round 0%)"')
  })

  it('should use custom background color', async () => {
    const options = { ...defaultOptions, backgroundColor: 'ff0000' }
    const svg = await createUserSVG(mockUsers, options)

    expect(svg).toContain('fill="#ff0000"')
  })

  it('should use custom text color', async () => {
    const options = { ...defaultOptions, textColor: '0000ff' }
    const svg = await createUserSVG(mockUsers, options)

    expect(svg).toContain('fill="#0000ff"')
  })

  it('should apply custom avatar size', async () => {
    const options = { ...defaultOptions, avatarSize: 80 }
    const svg = await createUserSVG(mockUsers, options)

    expect(svg).toContain('height="80px"')
    expect(svg).toContain('width="80px"')
  })

  it('should apply custom perRow value', async () => {
    const options = { ...defaultOptions, perRow: 5 }
    const svg = await createUserSVG(mockUsers, options)

    // Should calculate width based on perRow * (avatarSize + margin) + margin
    // 5 * (50 + 20) + 20 = 370
    expect(svg).toContain('width="370px"')
  })

  it('should include footer text when provided', async () => {
    const options = { ...defaultOptions, footerText: 'Made with Claude' }
    const svg = await createUserSVG(mockUsers, options)

    expect(svg).toContain('Made with Claude')
  })

  it('should use FOOTER_TEXT env variable when no custom footer', async () => {
    vi.stubEnv('FOOTER_TEXT', 'From Environment')
    const svg = await createUserSVG(mockUsers, defaultOptions)

    expect(svg).toContain('From Environment')
  })

  it('should not include footer when footerText is "none"', async () => {
    const options = { ...defaultOptions, footerText: 'none' }
    const svg = await createUserSVG(mockUsers, options)

    // Footer text element should not be present
    expect(svg).not.toContain('text-anchor="end"')
  })

  it('should apply outer border styling', async () => {
    const options = {
      ...defaultOptions,
      outerBorderWidth: 2,
      outerBorderColor: 'ff0000',
      outerBorderRadius: 10,
    }
    const svg = await createUserSVG(mockUsers, options)

    expect(svg).toContain('stroke="#ff0000"')
    expect(svg).toContain('stroke-width="2px"')
    expect(svg).toContain('rx="10px"')
  })

  it('should use custom SVG dimensions when provided', async () => {
    const options = { ...defaultOptions, svgWidth: 1000, svgHeight: 500 }
    const svg = await createUserSVG(mockUsers, options)

    expect(svg).toContain('width="1000px"')
    expect(svg).toContain('height="500px"')
  })

  it('should create responsive SVG when isResponsive is true', async () => {
    const options = { ...defaultOptions, isResponsive: true }
    const svg = await createUserSVG(mockUsers, options)

    expect(svg).toContain('width="100%"')
    expect(svg).toContain('height="100%"')
    expect(svg).toContain('viewBox="0 0')
  })

  it('should skip image encoding in dynamic mode', async () => {
    vi.clearAllMocks() // Clear previous mocks
    const fetchSpy = vi.mocked(fetch)
    const options = { ...defaultOptions, dynamic: true }
    await createUserSVG(mockUsers, options)

    // In dynamic mode, fetch should not be called for image encoding
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('should fetch and encode images when not in dynamic mode', async () => {
    vi.clearAllMocks() // Clear previous mocks
    vi.mocked(fetch).mockResolvedValue(createMockImageResponse() as any)
    const fetchSpy = vi.mocked(fetch)
    await createUserSVG(mockUsers, defaultOptions)

    // Should fetch 3 avatar images
    expect(fetchSpy).toHaveBeenCalledTimes(3)
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('avatars.githubusercontent.com')
    )
  })

  it('should handle empty user array', async () => {
    const svg = await createUserSVG([], defaultOptions)

    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"')
    expect(svg).not.toContain('xlink:href')
  })

  it('should handle users with null name gracefully', async () => {
    const users = [
      { login: 'testuser', name: null as any, avatarUrl: 'https://example.com/1' },
    ]
    const svg = await createUserSVG(users, defaultOptions)

    expect(svg).toContain('testuser')
  })

  it('should apply custom font family', async () => {
    const options = { ...defaultOptions, fontFamily: 'Comic Sans MS' }
    const svg = await createUserSVG(mockUsers, options)

    expect(svg).toContain('font-family="Comic Sans MS"')
  })

  it('should apply custom font size', async () => {
    const options = { ...defaultOptions, fontSize: 16 }
    const svg = await createUserSVG(mockUsers, options)

    expect(svg).toContain('font-size="16px"')
  })

  it('should calculate title font size as 2x normal font size', async () => {
    const options = { ...defaultOptions, title: 'Test Title', fontSize: 14 }
    const svg = await createUserSVG(mockUsers, options)

    expect(svg).toContain('font-size="28px"') // 14 * 2
  })

  it('should handle image fetch errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'))

    const svg = await createUserSVG(mockUsers, defaultOptions)

    // Should still generate SVG even if images fail to load
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"')
    expect(consoleErrorSpy).toHaveBeenCalled()

    consoleErrorSpy.mockRestore()
  })

  it('should apply custom margin', async () => {
    const options = { ...defaultOptions, margin: 30, perRow: 8 }
    const svg = await createUserSVG(mockUsers, options)

    // Width calculation: perRow * (avatarSize + margin) + margin
    // 8 * (50 + 30) + 30 = 670
    expect(svg).toContain('width="670px"')
  })

  it('should limit concurrent image fetches to 5', async () => {
    const manyUsers = Array.from({ length: 20 }, (_, i) => ({
      login: `user${i}`,
      name: `User ${i}`,
      avatarUrl: `https://example.com/${i}`,
    }))

    let concurrentFetches = 0
    let maxConcurrent = 0

    vi.mocked(fetch).mockImplementation(async () => {
      concurrentFetches++
      maxConcurrent = Math.max(maxConcurrent, concurrentFetches)
      await new Promise((resolve) => setTimeout(resolve, 10))
      concurrentFetches--
      return createMockImageResponse() as any
    })

    await createUserSVG(manyUsers, defaultOptions)

    expect(maxConcurrent).toBeLessThanOrEqual(5)
  })

  it('should handle transparent background color', async () => {
    const options = { ...defaultOptions, backgroundColor: 'transparent' }
    const svg = await createUserSVG(mockUsers, options)

    expect(svg).toContain('fill="transparent"')
  })

  it('should add transparency to text color when hasTransparency is true (footer)', async () => {
    const options = { ...defaultOptions, textColor: 'ff0000', footerText: 'Test' }
    const svg = await createUserSVG(mockUsers, options)

    // Footer text should have 80% opacity
    expect(svg).toContain('fill="#ff000080"')
  })
})
