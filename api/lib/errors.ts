/**
 * Error handling utilities
 * Provides custom error types and standardized error handling
 */

import type { Context } from 'hono'
import { logger } from './logger'

/**
 * Custom error for GitHub API failures
 */
export class GitHubAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string
  ) {
    super(message)
    this.name = 'GitHubAPIError'
  }
}

/**
 * Custom error for validation failures
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

/**
 * Creates an error SVG image
 */
export const createErrorSVG = (
  message: string,
  options: { width?: number; height?: number } = {}
): string => {
  const width = options.width || 800
  const height = options.height || 120

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect width="${width}" height="${height}" fill="#ff44441A" stroke="#ff4444" stroke-width="2"/>
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
            font-family="Arial, sans-serif" font-size="18" fill="#ff4444">
        Error: ${message}
      </text>
    </svg>
  `.trim()
}

/**
 * Standardized error handler for route errors
 * Logs the error and returns an error SVG
 */
export const handleRouteError = (
  c: Context,
  error: Error | unknown,
  options: { width?: number; height?: number } = {}
): Response => {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const path = c.req.path

  // Log to both console.log (for backward compatibility with tests) and logger.error
  console.log(error)
  logger.error('Route error', error, { path })

  const svg = createErrorSVG(errorMessage, options)

  return c.body(svg, 500, {
    'Content-Type': 'image/svg+xml',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
  })
}
