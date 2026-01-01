import { Resvg } from '@resvg/resvg-js'
import type { Context } from 'hono'
import type { StatusCode } from 'hono/utils/http-status'
import { badgeParamsSchema } from './lib/params-schema'
import type { SvgOptions } from './types'

/**
 * Get options for the output SVG, from the user's query parameters, or use defaults.
 * Now powered by Zod schema validation from params.json
 */
export const parseUrlOptions = (query: Record<string, string | undefined>): SvgOptions => {
  // Zod automatically validates, coerces types, and applies defaults
  return badgeParamsSchema.parse(query)
}

/**
 * Converts SVG string to PNG buffer using resvg
 */
export const convertSvgToPng = (svg: string): Buffer => {
  const resvg = new Resvg(svg)
  const pngData = resvg.render()
  return pngData.asPng()
}

/**
 * Sets headers and returns an image response (SVG or PNG) with appropriate caching
 */
export const returnImage = (
  c: Context,
  svg: string,
  format: 'svg' | 'png' = 'svg',
  statusCode: StatusCode = 200
) => {
  // Convert to PNG if requested
  if (format === 'png') {
    const pngBuffer = convertSvgToPng(svg)
    c.res.headers.set('Content-Type', 'image/png')

    // Add caching headers for successful responses
    if (statusCode === 200) {
      c.res.headers.set(
        'Cache-Control',
        'public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400'
      )
    }

    return c.body(pngBuffer, statusCode)
  }

  // Return SVG (default)
  c.res.headers.set('Content-Type', 'image/svg+xml')

  // Add caching headers for successful responses
  if (statusCode === 200) {
    c.res.headers.set(
      'Cache-Control',
      'public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400'
    )
  }

  return c.body(svg, statusCode)
}

/**
 * Backward compatibility alias for returnImage
 * @deprecated Use returnImage instead
 */
export const returnSvg = (c: Context, svg: string, statusCode: StatusCode = 200) => {
  return returnImage(c, svg, 'svg', statusCode)
}
