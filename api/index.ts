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
  return c.text(
    'Welcome to the readme-contribs API!\n\n'
    + 'This service will generate an SVG badge with the avatars of GitHub contributors or sponsors.\n'
    + 'Just make a request to `/contributors/:owner/:repo` or `/sponsors/:author`\n\n'
    + 'Example usage (paste this in your README.md)\n'
    + '\t![Sponsors](https://readme-contribs.as93.net/sponsors/lissy93)\n'
    + '\t![Contributors](https://readme-contribs.as93.net/contributors/lissy93/dashy)\n\n'
    + 'For full usage docs, deployment guide, contributing and bug reports, see: https://github.com/lissy93/readme-contribs'
  )
})

app.get('/sponsors/:author', async (c) => {
  const author = c.req.param('author')
  const options = parseUrlOptions(c.req.query())

  return fetchSponsors(author).then(async (sponsors) => {
    const svg = await createUserSVG(sponsors, options)
    c.res.headers.set('Content-Type', 'image/svg+xml')
    return c.body(svg)
  })
  .catch((error) => {
    console.log(error);
    return returnSvg(c, createErrorSVG(error, options), 500)
  });
})

app.get('/contributors/:owner/:repo', async (c) => {
  const owner = c.req.param('owner');
  const repo = c.req.param('repo');
  const options = parseUrlOptions(c.req.query());

  return fetchContributors(owner, repo, options.limit).then(async (contributors) => {
    const svg = await createUserSVG(contributors, options);
    c.res.headers.set('Content-Type', 'image/svg+xml');
    return c.body(svg);
  }).catch((error) => {
    console.log(error);
    return returnSvg(c, createErrorSVG(error, options), 500)
  });
});

export default handle(app)
