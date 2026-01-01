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
