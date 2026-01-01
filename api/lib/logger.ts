/**
 * Simple structured logger
 * Provides consistent logging across the application
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogMeta {
  [key: string]: unknown
}

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
}

const levelColors = {
  info: colors.blue,
  warn: colors.yellow,
  error: colors.red,
  debug: colors.gray,
}

const formatMessage = (level: LogLevel, message: string, meta?: LogMeta): string => {
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : ''
  const coloredLevel = `[${levelColors[level]}${level.toUpperCase()}${colors.reset}]`
  return `${coloredLevel} ${message}${metaStr}`
}

export const logger = {
  info: (message: string, meta?: LogMeta) => {
    console.log(formatMessage('info', message, meta))
  },

  warn: (message: string, meta?: LogMeta) => {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(formatMessage('warn', message, meta))
    }
  },

  error: (message: string, error?: Error | unknown, meta?: LogMeta) => {
    const errorMeta = {
      ...meta,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }
    console.error(formatMessage('error', message, errorMeta))
  },

  debug: (message: string, meta?: LogMeta) => {
    if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
      console.debug(formatMessage('debug', message, meta))
    }
  },
}
