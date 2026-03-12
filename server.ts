// Standalone Bun server for local development and Docker deployments
// Usage: bun run server.ts
import { serveStatic } from 'hono/bun'
import app from './api/server'

// Serve static files (Bun only - Vercel handles this via vercel.json)
app.use('/public/*', serveStatic({ root: './' }))
app.use('/favicon.png', serveStatic({ path: './public/favicon.png' }))
app.use('/styles.css', serveStatic({ path: './public/styles.css' }))
app.use('/app.js', serveStatic({ path: './public/app.js' }))
app.use('/utils.js', serveStatic({ path: './public/utils.js' }))
app.use('/config.js', serveStatic({ path: './public/config.js' }))
app.use('/icons.js', serveStatic({ path: './public/icons.js' }))
app.use('/api.html', serveStatic({ path: './public/api.html' }))
app.use('/api-spec.yml', serveStatic({ path: './public/api-spec.yml' }))
app.use('/api-docs', serveStatic({ path: './public/api.html' }))

const port = Number(process.env.PORT) || 8080

const host = process.env.HOST || 'http://localhost'

console.log(`🩵💚 readme-contribs is running at ${host}:${port}`)

export default {
  port,
  fetch: app.fetch,
}
