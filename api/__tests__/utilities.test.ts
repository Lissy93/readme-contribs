import type { Context } from 'hono'
import { describe, expect, it, vi } from 'vitest'
import { convertSvgToPng, parseUrlOptions, returnImage, returnSvg } from '../utilities'

describe('parseUrlOptions', () => {
  it('should return default options when no query params provided', () => {
    const result = parseUrlOptions({})

    expect(result).toEqual({
      title: '',
      avatarSize: 50,
      perRow: 8,
      shape: 'square',
      hideLabel: false,
      fontSize: 12,
      fontFamily: "'Mona Sans', 'Open Sans', Verdana, Arial, sans-serif",
      textColor: '333333',
      backgroundColor: 'transparent',
      limit: 96,
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
      format: 'svg',
    })
  })

  it('should parse string values correctly', () => {
    const result = parseUrlOptions({
      title: 'My Contributors',
      fontFamily: 'Arial',
      textColor: 'ff0000',
      backgroundColor: '000000',
      footerText: 'Made with love',
    })

    expect(result.title).toBe('My Contributors')
    expect(result.fontFamily).toBe('Arial')
    expect(result.textColor).toBe('ff0000')
    expect(result.backgroundColor).toBe('000000')
    expect(result.footerText).toBe('Made with love')
  })

  it('should parse integer values correctly', () => {
    const result = parseUrlOptions({
      avatarSize: '80',
      perRow: '5',
      fontSize: '16',
      limit: '50',
      outerBorderWidth: '2',
      outerBorderRadius: '10',
      margin: '15',
      textOffset: '25',
      svgWidth: '800',
      svgHeight: '600',
    })

    expect(result.avatarSize).toBe(80)
    expect(result.perRow).toBe(5)
    expect(result.fontSize).toBe(16)
    expect(result.limit).toBe(50)
    expect(result.outerBorderWidth).toBe(2)
    expect(result.outerBorderRadius).toBe(10)
    expect(result.margin).toBe(15)
    expect(result.textOffset).toBe(25)
    expect(result.svgWidth).toBe(800)
    expect(result.svgHeight).toBe(600)
  })

  it('should parse boolean values correctly', () => {
    const result = parseUrlOptions({
      hideLabel: 'true',
      dynamic: 'true',
      isResponsive: 'true',
    })

    expect(result.hideLabel).toBe(true)
    expect(result.dynamic).toBe(true)
    expect(result.isResponsive).toBe(true)
  })

  it('should handle false boolean values', () => {
    const result = parseUrlOptions({
      hideLabel: 'false',
      dynamic: 'false',
      isResponsive: 'false',
    })

    expect(result.hideLabel).toBe(false)
    expect(result.dynamic).toBe(false)
    expect(result.isResponsive).toBe(false)
  })

  it('should parse shape enum values', () => {
    expect(parseUrlOptions({ shape: 'circle' }).shape).toBe('circle')
    expect(parseUrlOptions({ shape: 'square' }).shape).toBe('square')
    expect(parseUrlOptions({ shape: 'squircle' }).shape).toBe('squircle')
  })

  it('should parse format enum values', () => {
    expect(parseUrlOptions({ format: 'svg' }).format).toBe('svg')
    expect(parseUrlOptions({ format: 'png' }).format).toBe('png')
  })

  it('should default format to svg for invalid values', () => {
    expect(parseUrlOptions({ format: 'invalid' }).format).toBe('svg')
    expect(parseUrlOptions({ format: 'jpg' }).format).toBe('svg')
  })

  it('should enforce minimum avatarSize of 30', () => {
    expect(parseUrlOptions({ avatarSize: '10' }).avatarSize).toBe(30)
    expect(parseUrlOptions({ avatarSize: '29' }).avatarSize).toBe(30)
    expect(parseUrlOptions({ avatarSize: '30' }).avatarSize).toBe(30)
    expect(parseUrlOptions({ avatarSize: '50' }).avatarSize).toBe(50)
  })

  it('should enforce minimum perRow of 1', () => {
    expect(parseUrlOptions({ perRow: '0' }).perRow).toBe(1)
    expect(parseUrlOptions({ perRow: '-5' }).perRow).toBe(1)
    expect(parseUrlOptions({ perRow: '1' }).perRow).toBe(1)
    expect(parseUrlOptions({ perRow: '10' }).perRow).toBe(10)
  })

  it('should enforce minimum fontSize of 10', () => {
    expect(parseUrlOptions({ fontSize: '5' }).fontSize).toBe(10)
    expect(parseUrlOptions({ fontSize: '9' }).fontSize).toBe(10)
    expect(parseUrlOptions({ fontSize: '10' }).fontSize).toBe(10)
    expect(parseUrlOptions({ fontSize: '20' }).fontSize).toBe(20)
  })

  it('should handle invalid number strings by returning defaults', () => {
    const result = parseUrlOptions({
      avatarSize: 'invalid',
      perRow: 'abc',
      fontSize: 'xyz',
    })

    // Invalid strings now return defaults instead of NaN
    expect(result.avatarSize).toBe(50) // default
    expect(result.perRow).toBe(8) // default
    expect(result.fontSize).toBe(12) // default
  })

  it('should handle empty string values', () => {
    const result = parseUrlOptions({
      title: '',
      outerBorderColor: '',
      footerText: '',
    })

    expect(result.title).toBe('')
    expect(result.outerBorderColor).toBe('')
    expect(result.footerText).toBe('')
  })

  it('should handle undefined values gracefully', () => {
    const result = parseUrlOptions({
      title: undefined,
      avatarSize: undefined,
      hideLabel: undefined,
    })

    expect(result.title).toBe('')
    expect(result.avatarSize).toBe(50)
    expect(result.hideLabel).toBe(false)
  })

  it('should handle mixed valid and invalid inputs', () => {
    const result = parseUrlOptions({
      title: 'Valid Title',
      avatarSize: '100',
      perRow: 'invalid',
      fontSize: '20',
      hideLabel: 'true',
      shape: 'circle',
      backgroundColor: 'ffffff',
    })

    expect(result.title).toBe('Valid Title')
    expect(result.avatarSize).toBe(100)
    expect(result.perRow).toBe(8) // invalid → default
    expect(result.fontSize).toBe(20)
    expect(result.hideLabel).toBe(true)
    expect(result.shape).toBe('circle')
    expect(result.backgroundColor).toBe('ffffff')
  })
})

describe('returnSvg', () => {
  it('should set correct Content-Type header and return SVG with default status', () => {
    const mockContext = {
      res: {
        headers: new Map(),
      },
      body: vi.fn((content, status) => ({ content, status })),
    } as unknown as Context

    const svg = '<svg>test</svg>'
    const result = returnSvg(mockContext, svg)

    expect(mockContext.res.headers.get('Content-Type')).toBe('image/svg+xml')
    expect(result).toEqual({ content: svg, status: 200 })
  })

  it('should use custom status code when provided', () => {
    const mockContext = {
      res: {
        headers: new Map(),
      },
      body: vi.fn((content, status) => ({ content, status })),
    } as unknown as Context

    const svg = '<svg>error</svg>'
    const result = returnSvg(mockContext, svg, 500)

    expect(mockContext.res.headers.get('Content-Type')).toBe('image/svg+xml')
    expect(result).toEqual({ content: svg, status: 500 })
  })

  it('should handle 404 status code', () => {
    const mockContext = {
      res: {
        headers: new Map(),
      },
      body: vi.fn((content, status) => ({ content, status })),
    } as unknown as Context

    const svg = '<svg>not found</svg>'
    const result = returnSvg(mockContext, svg, 404)

    expect(result.status).toBe(404)
  })

  it('should handle empty SVG string', () => {
    const mockContext = {
      res: {
        headers: new Map(),
      },
      body: vi.fn((content, status) => ({ content, status })),
    } as unknown as Context

    const result = returnSvg(mockContext, '', 200)

    expect(result.content).toBe('')
    expect(mockContext.res.headers.get('Content-Type')).toBe('image/svg+xml')
  })

  it('should add cache headers for successful responses', () => {
    const mockContext = {
      res: {
        headers: new Map(),
      },
      body: vi.fn((content, status) => ({ content, status })),
    } as unknown as Context

    const svg = '<svg>test</svg>'
    returnSvg(mockContext, svg, 200)

    expect(mockContext.res.headers.get('Cache-Control')).toBe(
      'public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400'
    )
  })

  it('should not add cache headers for error responses', () => {
    const mockContext = {
      res: {
        headers: new Map(),
      },
      body: vi.fn((content, status) => ({ content, status })),
    } as unknown as Context

    const svg = '<svg>error</svg>'
    returnSvg(mockContext, svg, 500)

    expect(mockContext.res.headers.get('Cache-Control')).toBeUndefined()
  })
})

describe('convertSvgToPng', () => {
  it('should convert SVG to PNG buffer', () => {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" fill="red"/></svg>'
    const pngBuffer = convertSvgToPng(svg)

    expect(Buffer.isBuffer(pngBuffer)).toBe(true)
    expect(pngBuffer.length).toBeGreaterThan(0)
    // PNG files start with specific magic bytes
    expect(pngBuffer[0]).toBe(0x89)
    expect(pngBuffer[1]).toBe(0x50) // 'P'
    expect(pngBuffer[2]).toBe(0x4e) // 'N'
    expect(pngBuffer[3]).toBe(0x47) // 'G'
  })

  it('should handle simple SVG shapes', () => {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50"><rect width="50" height="50" fill="blue"/></svg>'
    const pngBuffer = convertSvgToPng(svg)

    expect(Buffer.isBuffer(pngBuffer)).toBe(true)
    expect(pngBuffer.length).toBeGreaterThan(0)
  })
})

describe('returnImage', () => {
  it('should return SVG when format is svg', () => {
    const mockContext = {
      res: {
        headers: new Map(),
      },
      body: vi.fn((content, status) => ({ content, status })),
    } as unknown as Context

    const svg = '<svg>test</svg>'
    const result = returnImage(mockContext, svg, 'svg')

    expect(mockContext.res.headers.get('Content-Type')).toBe('image/svg+xml')
    expect(result).toEqual({ content: svg, status: 200 })
  })

  it('should return PNG when format is png', () => {
    const mockContext = {
      res: {
        headers: new Map(),
      },
      body: vi.fn((content, status) => ({ content, status })),
    } as unknown as Context

    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" fill="red"/></svg>'
    const result = returnImage(mockContext, svg, 'png')

    expect(mockContext.res.headers.get('Content-Type')).toBe('image/png')
    expect(Buffer.isBuffer(result.content)).toBe(true)
  })

  it('should default to SVG when format is not specified', () => {
    const mockContext = {
      res: {
        headers: new Map(),
      },
      body: vi.fn((content, status) => ({ content, status })),
    } as unknown as Context

    const svg = '<svg>test</svg>'
    const _result = returnImage(mockContext, svg)

    expect(mockContext.res.headers.get('Content-Type')).toBe('image/svg+xml')
  })

  it('should add cache headers for PNG responses', () => {
    const mockContext = {
      res: {
        headers: new Map(),
      },
      body: vi.fn((content, status) => ({ content, status })),
    } as unknown as Context

    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50"><rect width="50" height="50"/></svg>'
    returnImage(mockContext, svg, 'png', 200)

    expect(mockContext.res.headers.get('Cache-Control')).toBe(
      'public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400'
    )
  })

  it('should not add cache headers for PNG error responses', () => {
    const mockContext = {
      res: {
        headers: new Map(),
      },
      body: vi.fn((content, status) => ({ content, status })),
    } as unknown as Context

    const svg = '<svg xmlns="http://www.w3.org/2000/svg">error</svg>'
    returnImage(mockContext, svg, 'png', 500)

    expect(mockContext.res.headers.get('Cache-Control')).toBeUndefined()
  })
})
