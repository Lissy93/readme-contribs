import { Hono } from 'hono'
import { fetchContributors, fetchForkers, fetchSponsors, fetchStargazers } from './fetch-users'
import { createUserRouteHandler } from './lib/route-handlers'

// Platform-agnostic Hono app
// Works with: Vercel Edge, Bun, Docker
const app = new Hono()

// Serve static files - only in Bun runtime (not in tests/Vercel)
// For Vercel, static files are handled by platform config (vercel.json)
// @ts-expect-error - Bun global is only available in Bun runtime
if (typeof globalThis.Bun !== 'undefined') {
  // Use dynamic import with .then() to avoid top-level await (Vercel compatibility)
  import('hono/bun').then(({ serveStatic }) => {
    app.use('/public/*', serveStatic({ root: './' }))
    app.use('/favicon.png', serveStatic({ path: './public/favicon.png' }))
    app.use('/styles.css', serveStatic({ path: './public/styles.css' }))
    app.use('/script.js', serveStatic({ path: './public/script.js' }))
    app.use('/api.html', serveStatic({ path: './public/api.html' }))
    app.use('/api-docs', serveStatic({ path: './public/api.html' }))
    app.use('/test.html', serveStatic({ path: './public/test.html' }))
  })
}

// API routes
// Healthcheck endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/', async (c) => {
  // In Bun, serve the index.html file
  // @ts-expect-error - Bun global is only available in Bun runtime
  if (typeof globalThis.Bun !== 'undefined') {
    // @ts-expect-error - Bun.file is only available in Bun runtime
    const file = globalThis.Bun.file('./public/index.html')
    return c.html(await file.text())
  }
  // In Vercel/Cloudflare/Netlify, this is handled by platform config
  // But provide a fallback text response for edge cases
  return c.text(
    'Welcome to the readme-contribs API!\n\n' +
      'This service will generate an SVG badge with the avatars of GitHub contributors or sponsors.\n' +
      'Just make a request to `/contributors/:owner/:repo` or `/sponsors/:author`\n\n' +
      'Example usage (paste this in your README.md)\n' +
      '\t![Sponsors](https://readme-contribs.as93.net/sponsors/lissy93)\n' +
      '\t![Contributors](https://readme-contribs.as93.net/contributors/lissy93/dashy)\n\n' +
      'For full usage docs, deployment guide, contributing and bug reports, see: https://github.com/lissy93/readme-contribs'
  )
})

app.get('/sponsors/:author', createUserRouteHandler(fetchSponsors))

app.get('/contributors/:owner/:repo', createUserRouteHandler(fetchContributors))

app.get('/stargazers/:owner/:repo', createUserRouteHandler(fetchStargazers))

app.get('/forkers/:owner/:repo', createUserRouteHandler(fetchForkers))

export default app
