import type { Context } from 'hono'
import type { StatusCode } from 'hono/utils/http-status'

import type { Shape, SvgOptions } from './types'

/**
 * Get options for the output SVG, from the user's query parameters, or use defaults.
 */
export const parseUrlOptions = (query: Record<string, string | undefined>): SvgOptions => {
  return {
    title: query.title || '',
    avatarSize: Math.max(30, parseInt(query.avatarSize || '50', 10)),
    perRow: Math.max(1, parseInt(query.perRow || '8', 10)),
    shape: (query.shape as Shape) || 'square',
    hideLabel: query.hideLabel === 'true',
    fontSize: Math.max(10, parseInt(query.fontSize || '12', 10)),
    fontFamily: query.fontFamily || "'Mona Sans', 'Open Sans', Verdana, Arial, sans-serif",
    textColor: query.textColor || '333333',
    backgroundColor: query.backgroundColor || 'transparent',
    limit: parseInt(query.limit || '100', 10),
    outerBorderWidth: parseInt(query.outerBorderWidth || '0', 10),
    outerBorderColor: query.outerBorderColor || '',
    outerBorderRadius: parseInt(query.outerBorderRadius || '0', 10),
    margin: parseInt(query.margin || '20', 10),
    textOffset: parseInt(query.textOffset || '20', 10),
    svgWidth: parseInt(query.svgWidth || '', 10),
    svgHeight: parseInt(query.svgHeight || '', 10),
    footerText: query.footerText || '',
    dynamic: query.dynamic === 'true',
    isResponsive: query.isResponsive === 'true',
  }
}

/**
 * Sets headers and returns an SVG response
 */
export const returnSvg = (c: Context, svg: string, statusCode: StatusCode = 200) => {
  c.res.headers.set('Content-Type', 'image/svg+xml')
  return c.body(svg, statusCode)
}
