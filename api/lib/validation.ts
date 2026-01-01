/**
 * Input validation utilities
 * Validates and sanitizes user inputs to prevent injection attacks
 */

import { ValidationError } from './errors'

/**
 * Valid GitHub username/repo name pattern
 * Allows: alphanumeric, hyphens, underscores, dots
 * Max length: 39 characters (GitHub's limit)
 */
const GITHUB_NAME_PATTERN = /^[a-zA-Z0-9._-]{1,39}$/

/**
 * Valid shape values
 */
const VALID_SHAPES = ['square', 'squircle', 'circle'] as const

/**
 * Validates a GitHub username or repository name
 */
export const validateGitHubName = (name: string, fieldName: string): string => {
  if (!name || typeof name !== 'string') {
    throw new ValidationError(`${fieldName} is required`)
  }

  if (!GITHUB_NAME_PATTERN.test(name)) {
    throw new ValidationError(`${fieldName} contains invalid characters or exceeds length limit`)
  }

  return name
}

/**
 * Validates shape parameter
 */
export const validateShape = (shape: string): string => {
  if (!VALID_SHAPES.includes(shape as (typeof VALID_SHAPES)[number])) {
    throw new ValidationError(`Invalid shape value. Must be one of: ${VALID_SHAPES.join(', ')}`)
  }

  return shape
}

/**
 * Validates and sanitizes a numeric parameter
 * Returns the parsed number or the default value if invalid
 */
export const validateNumber = (
  value: string | undefined,
  defaultValue: number,
  min?: number,
  max?: number
): number => {
  if (!value) {
    return defaultValue
  }

  const parsed = parseInt(value, 10)

  if (Number.isNaN(parsed)) {
    return defaultValue
  }

  if (min !== undefined && parsed < min) {
    return min
  }

  if (max !== undefined && parsed > max) {
    return max
  }

  return parsed
}

/**
 * Validates hex color format
 */
export const validateHexColor = (color: string | undefined, defaultColor: string): string => {
  if (!color) {
    return defaultColor
  }

  // Remove # if present
  const cleanColor = color.replace(/^#/, '')

  // Validate hex format (3 or 6 characters)
  if (/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(cleanColor)) {
    return cleanColor
  }

  return defaultColor
}
