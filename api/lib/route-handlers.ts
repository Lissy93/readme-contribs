/**
 * Route handler factory
 * Creates standardized route handlers with consistent error handling
 */

import type { Context } from 'hono'
import { createUserSVG } from '../svg-output'
import type { SvgOptions, User } from '../types'
import { returnSvg } from '../utilities'
import { handleRouteError } from './errors'
import { validateGitHubName } from './validation'

/**
 * Type for user data fetcher functions
 */
type UserFetcher = (...args: string[]) => Promise<User[]>

/**
 * Creates a route handler for user-based endpoints (sponsors, contributors, etc.)
 * This eliminates the duplicate route handling pattern
 */
export const createUserRouteHandler = (fetcher: UserFetcher) => {
  return async (c: Context) => {
    try {
      // Extract path parameters (owner, repo, or author)
      const params = c.req.param()

      // Validate path parameters
      const validatedArgs: string[] = []
      if (params.owner) {
        validatedArgs.push(validateGitHubName(params.owner, 'owner'))
      }
      if (params.repo) {
        validatedArgs.push(validateGitHubName(params.repo, 'repo'))
      }
      if (params.author) {
        validatedArgs.push(validateGitHubName(params.author, 'author'))
      }

      // Parse query options (now includes validation)
      const { parseUrlOptions } = await import('../utilities')
      const options: SvgOptions = parseUrlOptions(c.req.query())

      // Fetch users using the provided fetcher function
      const users = await fetcher(...validatedArgs, options.limit)

      // Generate SVG
      const svg = await createUserSVG(users, options)

      // Return SVG with proper headers
      return returnSvg(c, svg)
    } catch (error) {
      // Handle errors consistently (including validation errors)
      const { parseUrlOptions } = await import('../utilities')
      const options: SvgOptions = parseUrlOptions(c.req.query())
      return handleRouteError(c, error, options)
    }
  }
}
