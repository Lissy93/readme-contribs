/**
 * Parameter validation tests
 * Tests Zod schema validation for badge parameters
 */

import { describe, expect, it } from 'vitest'
import { badgeParamsSchema } from '../lib/params-schema'

describe('Badge Parameters Validation', () => {
  describe('Number parameters', () => {
    it('should clamp avatarSize to min value', () => {
      const result = badgeParamsSchema.parse({ avatarSize: '10' })
      expect(result.avatarSize).toBe(30) // min is 30
    })

    it('should clamp avatarSize to max value', () => {
      const result = badgeParamsSchema.parse({ avatarSize: '500' })
      expect(result.avatarSize).toBe(200) // max is 200
    })

    it('should accept valid avatarSize', () => {
      const result = badgeParamsSchema.parse({ avatarSize: '80' })
      expect(result.avatarSize).toBe(80)
    })

    it('should use default for invalid number', () => {
      const result = badgeParamsSchema.parse({ avatarSize: 'invalid' })
      expect(result.avatarSize).toBe(50) // default
    })

    it('should clamp perRow to min value', () => {
      const result = badgeParamsSchema.parse({ perRow: '0' })
      expect(result.perRow).toBe(1) // min is 1
    })

    it('should clamp perRow to max value', () => {
      const result = badgeParamsSchema.parse({ perRow: '100' })
      expect(result.perRow).toBe(50) // max is 50
    })

    it('should clamp limit to max value', () => {
      const result = badgeParamsSchema.parse({ limit: '1000' })
      expect(result.limit).toBe(500) // max is 500
    })

    it('should use default limit when not provided', () => {
      const result = badgeParamsSchema.parse({})
      expect(result.limit).toBe(96) // default changed to 96
    })

    it('should clamp fontSize to min value', () => {
      const result = badgeParamsSchema.parse({ fontSize: '5' })
      expect(result.fontSize).toBe(10) // min is 10
    })

    it('should clamp fontSize to max value', () => {
      const result = badgeParamsSchema.parse({ fontSize: '50' })
      expect(result.fontSize).toBe(32) // max is 32
    })

    it('should handle negative numbers gracefully', () => {
      const result = badgeParamsSchema.parse({ margin: '-10' })
      expect(result.margin).toBe(0) // min is 0
    })
  })

  describe('String parameters', () => {
    it('should accept valid string for title', () => {
      const result = badgeParamsSchema.parse({ title: 'My Contributors' })
      expect(result.title).toBe('My Contributors')
    })

    it('should use default empty string for title', () => {
      const result = badgeParamsSchema.parse({})
      expect(result.title).toBe('')
    })

    it('should accept valid hex color', () => {
      const result = badgeParamsSchema.parse({ textColor: 'FF5733' })
      expect(result.textColor).toBe('FF5733')
    })

    it('should accept named colors', () => {
      const result = badgeParamsSchema.parse({ backgroundColor: 'white' })
      expect(result.backgroundColor).toBe('white')
    })
  })

  describe('Enum parameters', () => {
    it('should accept valid enum value: square', () => {
      const result = badgeParamsSchema.parse({ shape: 'square' })
      expect(result.shape).toBe('square')
    })

    it('should accept valid enum value: circle', () => {
      const result = badgeParamsSchema.parse({ shape: 'circle' })
      expect(result.shape).toBe('circle')
    })

    it('should accept valid enum value: squircle', () => {
      const result = badgeParamsSchema.parse({ shape: 'squircle' })
      expect(result.shape).toBe('squircle')
    })

    it('should use default for invalid enum value', () => {
      const result = badgeParamsSchema.parse({ shape: 'invalid' })
      expect(result.shape).toBe('square') // default
    })
  })

  describe('Boolean parameters', () => {
    it('should accept true boolean', () => {
      const result = badgeParamsSchema.parse({ hideLabel: true })
      expect(result.hideLabel).toBe(true)
    })

    it('should accept false boolean', () => {
      const result = badgeParamsSchema.parse({ hideLabel: false })
      expect(result.hideLabel).toBe(false)
    })

    it('should convert string "true" to boolean', () => {
      const result = badgeParamsSchema.parse({ dynamic: 'true' })
      expect(result.dynamic).toBe(true)
    })

    it('should convert string "false" to boolean', () => {
      const result = badgeParamsSchema.parse({ isResponsive: 'false' })
      expect(result.isResponsive).toBe(false)
    })

    it('should use default for invalid boolean string', () => {
      const result = badgeParamsSchema.parse({ hideLabel: 'invalid' })
      expect(result.hideLabel).toBe(false) // default
    })
  })

  describe('Complete parameter sets', () => {
    it('should handle all valid parameters', () => {
      const input = {
        title: 'My Badge',
        avatarSize: '64',
        perRow: '10',
        shape: 'circle',
        hideLabel: 'false',
        fontSize: '14',
        fontFamily: 'Arial',
        textColor: 'white',
        backgroundColor: 'black',
        limit: '50',
        outerBorderWidth: '2',
        outerBorderColor: 'red',
        outerBorderRadius: '5',
        margin: '10',
        textOffset: '15',
        svgWidth: '800',
        svgHeight: '400',
        footerText: 'Made with ❤️',
        dynamic: 'true',
        isResponsive: 'true',
      }

      const result = badgeParamsSchema.parse(input)

      expect(result.title).toBe('My Badge')
      expect(result.avatarSize).toBe(64)
      expect(result.perRow).toBe(10)
      expect(result.shape).toBe('circle')
      expect(result.hideLabel).toBe(false)
      expect(result.fontSize).toBe(14)
      expect(result.fontFamily).toBe('Arial')
      expect(result.textColor).toBe('white')
      expect(result.backgroundColor).toBe('black')
      expect(result.limit).toBe(50)
      expect(result.outerBorderWidth).toBe(2)
      expect(result.outerBorderColor).toBe('red')
      expect(result.outerBorderRadius).toBe(5)
      expect(result.margin).toBe(10)
      expect(result.textOffset).toBe(15)
      expect(result.svgWidth).toBe(800)
      expect(result.svgHeight).toBe(400)
      expect(result.footerText).toBe('Made with ❤️')
      expect(result.dynamic).toBe(true)
      expect(result.isResponsive).toBe(true)
    })

    it('should use all defaults for empty input', () => {
      const result = badgeParamsSchema.parse({})

      expect(result.title).toBe('')
      expect(result.avatarSize).toBe(50)
      expect(result.perRow).toBe(8)
      expect(result.shape).toBe('square')
      expect(result.hideLabel).toBe(false)
      expect(result.fontSize).toBe(12)
      expect(result.fontFamily).toBe("'Mona Sans', 'Open Sans', Verdana, Arial, sans-serif")
      expect(result.textColor).toBe('333333')
      expect(result.backgroundColor).toBe('transparent')
      expect(result.limit).toBe(96)
      expect(result.outerBorderWidth).toBe(0)
      expect(result.outerBorderColor).toBe('')
      expect(result.outerBorderRadius).toBe(0)
      expect(result.margin).toBe(20)
      expect(result.textOffset).toBe(20)
      expect(result.svgWidth).toBe(0)
      expect(result.svgHeight).toBe(0)
      expect(result.footerText).toBe('')
      expect(result.dynamic).toBe(false)
      expect(result.isResponsive).toBe(false)
    })

    it('should handle mixed valid and invalid parameters', () => {
      const input = {
        avatarSize: '1000', // over max, should clamp
        perRow: '-5', // under min, should clamp
        shape: 'triangle', // invalid enum, should default
        fontSize: 'abc', // invalid number, should default
        dynamic: 'yes', // invalid boolean, should default
      }

      const result = badgeParamsSchema.parse(input)

      expect(result.avatarSize).toBe(200) // clamped to max
      expect(result.perRow).toBe(1) // clamped to min
      expect(result.shape).toBe('square') // default
      expect(result.fontSize).toBe(12) // default
      expect(result.dynamic).toBe(false) // default
    })
  })

  describe('Edge cases', () => {
    it('should handle undefined values', () => {
      const result = badgeParamsSchema.parse({ title: undefined })
      expect(result.title).toBe('')
    })

    it('should handle null values as strings', () => {
      const result = badgeParamsSchema.parse({ avatarSize: null })
      expect(result.avatarSize).toBe(30) // Number(null) = 0, clamped to min
    })

    it('should handle empty string numbers', () => {
      const result = badgeParamsSchema.parse({ perRow: '' })
      expect(result.perRow).toBe(1) // Number('') = 0, clamped to min
    })

    it('should handle numeric strings with whitespace', () => {
      const result = badgeParamsSchema.parse({ avatarSize: ' 80 ' })
      expect(result.avatarSize).toBe(80)
    })

    it('should handle zero values where allowed', () => {
      const result = badgeParamsSchema.parse({
        svgWidth: '0',
        svgHeight: '0',
        outerBorderWidth: '0',
      })
      expect(result.svgWidth).toBe(0)
      expect(result.svgHeight).toBe(0)
      expect(result.outerBorderWidth).toBe(0)
    })
  })
})
