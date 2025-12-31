// Standalone Bun server for local development and Docker deployments
// Usage: bun run server.ts
import app from './api/server'

const port = Number(process.env.PORT) || 8080

const host = process.env.HOST || 'http://localhost'

console.log(`🩵💚 readme-contribs is running at ${host}:${port}`)

export default {
  port,
  fetch: app.fetch,
}
