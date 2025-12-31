import type { Context } from 'hono'
import type { StatusCode } from 'hono/utils/http-status'
import { validateHexColor, validateNumber, validateShape } from './lib/validation'
import type { Shape, SvgOptions } from './types'

/**
 * Safely parses an integer with fallback to default
 */
const safeParseInt = (value: string | undefined, defaultValue: number, min?: number): number => {
  return validateNumber(value, defaultValue, min)
}

/**
 * Get options for the output SVG, from the user's query parameters, or use defaults.
 */
export const parseUrlOptions = (query: Record<string, string | undefined>): SvgOptions => {
  // Validate shape if provided
  const shape = query.shape ? (validateShape(query.shape) as Shape) : 'square'

  return {
    title: query.title || '',
    avatarSize: safeParseInt(query.avatarSize, 50, 30),
    perRow: safeParseInt(query.perRow, 8, 1),
    shape,
    hideLabel: query.hideLabel === 'true',
    fontSize: safeParseInt(query.fontSize, 12, 10),
    fontFamily: query.fontFamily || "'Mona Sans', 'Open Sans', Verdana, Arial, sans-serif",
    textColor: validateHexColor(query.textColor, '333333'),
    backgroundColor: query.backgroundColor || 'transparent',
    limit: safeParseInt(query.limit, 100, 1),
    outerBorderWidth: safeParseInt(query.outerBorderWidth, 0, 0),
    outerBorderColor: query.outerBorderColor || '',
    outerBorderRadius: safeParseInt(query.outerBorderRadius, 0, 0),
    margin: safeParseInt(query.margin, 20, 0),
    textOffset: safeParseInt(query.textOffset, 20, 0),
    svgWidth: safeParseInt(query.svgWidth, 0, 0),
    svgHeight: safeParseInt(query.svgHeight, 0, 0),
    footerText: query.footerText || '',
    dynamic: query.dynamic === 'true',
    isResponsive: query.isResponsive === 'true',
  }
}

/**
 * Sets headers and returns an SVG response with appropriate caching
 */
export const returnSvg = (c: Context, svg: string, statusCode: StatusCode = 200) => {
  c.res.headers.set('Content-Type', 'image/svg+xml')

  // Add caching headers for successful responses
  // Cache for 1 hour in browser, 2 hours in CDN/edge cache
  if (statusCode === 200) {
    c.res.headers.set(
      'Cache-Control',
      'public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400'
    )
  }

  return c.body(svg, statusCode)
}
