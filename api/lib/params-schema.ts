/**
 * Parameter schema generator
 * Auto-generates Zod schemas from JSON configuration
 * Single source of truth for all badge parameters
 */

import { z } from 'zod'
import paramsConfig from '../config/params.js'

type ParamConfig = {
  type: 'string' | 'number' | 'boolean' | 'enum'
  default: string | number | boolean
  description: string
  label: string
  placeholder: string
  min?: number
  max?: number
  values?: string[]
}

/**
 * Builds a Zod schema from JSON configuration
 */
function buildZodSchema(config: Record<string, ParamConfig>) {
  const schemaFields: Record<string, z.ZodTypeAny> = {}

  for (const [key, param] of Object.entries(config)) {
    let field: z.ZodTypeAny

    if (param.type === 'string') {
      field = z.string().default(param.default as string)
    } else if (param.type === 'number') {
      // Use preprocess + transform to handle invalid inputs gracefully and clamp values
      field = z.preprocess(
        (val) => {
          // Convert to number, return default if invalid
          const num = Number(val)
          return Number.isNaN(num) ? param.default : num
        },
        z
          .number()
          .transform((val) => {
            // Clamp to min/max
            if (param.min !== undefined && val < param.min) return param.min
            if (param.max !== undefined && val > param.max) return param.max
            return val
          })
          .default(param.default as number)
      )
    } else if (param.type === 'boolean') {
      field = z
        .union([z.boolean(), z.string().transform((val) => val === 'true')])
        .default(param.default as boolean)
    } else if (param.type === 'enum' && param.values) {
      // Use catch to gracefully handle invalid enum values
      field = z
        .enum(param.values as [string, ...string[]])
        .catch(param.default as string)
        .default(param.default as string)
    } else {
      throw new Error(`Unknown parameter type: ${param.type}`)
    }

    schemaFields[key] = field.describe(param.description)
  }

  return z.object(schemaFields)
}

/**
 * Badge parameters Zod schema
 * Auto-generated from params.json
 */
export const badgeParamsSchema = buildZodSchema(paramsConfig as Record<string, ParamConfig>)

/**
 * TypeScript type for badge parameters
 * Auto-inferred from Zod schema
 */
export type BadgeParams = z.infer<typeof badgeParamsSchema>

/**
 * Export params config for frontend use
 */
export { paramsConfig }
