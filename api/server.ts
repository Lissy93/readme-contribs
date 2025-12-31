import { Hono } from 'hono'
import { fetchContributors, fetchForkers, fetchSponsors, fetchStargazers } from './fetch-users'
import { createErrorSVG, createUserSVG } from './svg-output'
import { parseUrlOptions, returnSvg } from './utilities'

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

app.get('/sponsors/:author', async (c) => {
  const author = c.req.param('author')
  const options = parseUrlOptions(c.req.query())

  return fetchSponsors(author)
    .then(async (sponsors) => {
      const svg = await createUserSVG(sponsors, options)
      c.res.headers.set('Content-Type', 'image/svg+xml')
      return c.body(svg)
    })
    .catch((error) => {
      console.log(error)
      return returnSvg(c, createErrorSVG(error, options), 500)
    })
})

app.get('/contributors/:owner/:repo', async (c) => {
  const owner = c.req.param('owner')
  const repo = c.req.param('repo')
  const options = parseUrlOptions(c.req.query())

  return fetchContributors(owner, repo, options.limit)
    .then(async (contributors) => {
      const svg = await createUserSVG(contributors, options)
      c.res.headers.set('Content-Type', 'image/svg+xml')
      return c.body(svg)
    })
    .catch((error) => {
      console.log(error)
      return returnSvg(c, createErrorSVG(error, options), 500)
    })
})

app.get('/stargazers/:owner/:repo', async (c) => {
  const owner = c.req.param('owner')
  const repo = c.req.param('repo')
  const options = parseUrlOptions(c.req.query())

  return fetchStargazers(owner, repo, options.limit)
    .then(async (contributors) => {
      const svg = await createUserSVG(contributors, options)
      c.res.headers.set('Content-Type', 'image/svg+xml')
      return c.body(svg)
    })
    .catch((error) => {
      console.log(error)
      return returnSvg(c, createErrorSVG(error, options), 500)
    })
})

app.get('/forkers/:owner/:repo', async (c) => {
  const owner = c.req.param('owner')
  const repo = c.req.param('repo')
  const options = parseUrlOptions(c.req.query())

  return fetchForkers(owner, repo, options.limit)
    .then(async (contributors) => {
      const svg = await createUserSVG(contributors, options)
      c.res.headers.set('Content-Type', 'image/svg+xml')
      return c.body(svg)
    })
    .catch((error) => {
      console.log(error)
      return returnSvg(c, createErrorSVG(error, options), 500)
    })
})

export default app
