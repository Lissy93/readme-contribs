import { beforeEach, vi } from 'vitest'

// Reset all mocks before each test
beforeEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

// Mock global fetch for all tests
globalThis.fetch = vi.fn() as unknown as typeof fetch

// Mock btoa (base64 encoding) for Node.js environment
globalThis.btoa = (str: string) => Buffer.from(str, 'binary').toString('base64')
