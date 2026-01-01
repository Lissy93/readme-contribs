/**
 * Type definitions
 * SvgOptions is now auto-generated from params schema
 */

export interface User {
  login: string
  name: string
  avatarUrl: string
}

export type Shape = 'square' | 'squircle' | 'circle'

/**
 * Badge/SVG options - auto-generated from Zod schema
 * @see api/lib/params-schema.ts
 */
export type { BadgeParams as SvgOptions } from './lib/params-schema'
