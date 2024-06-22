import { Hono } from 'hono'
import { handle } from 'hono/vercel'

import { fetchContributors, fetchSponsors } from './fetch-users'
import { createUserSVG, createErrorSVG } from './svg-output'
import { parseUrlOptions, returnSvg } from './utilities'

export const config = {
  runtime: 'edge'
}

const app = new Hono().basePath('/')

app.get('/', (c) => {
  return c.json({ message: 'Hello Hono!' })
})

app.get('/sponsors/:author', async (c) => {
  const author = c.req.param('author')
  const options = parseUrlOptions(c.req.query())

  return fetchSponsors(author).then((sponsors) => {
    const svg = createUserSVG(sponsors, options)
    c.res.headers.set('Content-Type', 'image/svg+xml')
    return c.body(svg)
  })
  .catch((error) => {
    return returnSvg(c, createErrorSVG(error, options), 500)
  });
})

app.get('/contributors/:owner/:repo', async (c) => {
  const owner = c.req.param('owner');
  const repo = c.req.param('repo');
  const options = parseUrlOptions(c.req.query());

  return fetchContributors(owner, repo, options.limit).then((contributors) => {
    const svg = createUserSVG(contributors, options);
    c.res.headers.set('Content-Type', 'image/svg+xml');
    return c.body(svg);
  }).catch((error) => {
    return returnSvg(c, createErrorSVG(error, options), 500)
  });
});

export default handle(app)
