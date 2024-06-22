import { Context, Hono } from 'hono'
import { handle } from 'hono/vercel'

export const config = {
  runtime: 'edge'
}

const app = new Hono().basePath('/')

interface User {
  login: string
  name: string
  avatarUrl: string
}

type Shape = 'square' | 'squircle' | 'circle';

interface SvgOptions {
  title: string;
  avatarSize: number;
  perRow: number;
  shape: Shape;
  fontSize: number;
  textColor: string;
  backgroundColor: string;
  fontFamily: string;
  margin: number;
  textOffset: number;
  limit: number;
}

/**
 * Get options for the output SVG, from the user's query parameters, or use defaults.
 */
const parseOptions = (query: Record<string, string | undefined>): SvgOptions => {
  return {
    title: query.title || '',
    avatarSize: Math.max(30, parseInt(query.avatarSize || '50')),
    perRow: Math.max(1, parseInt(query.perRow || '8')),
    shape: query.shape as Shape || 'square',
    fontSize: Math.max(10, parseInt(query.fontSize || '12')),
    textColor: query.textColor || '#333333',
    backgroundColor: query.backgroundColor || 'transparent',
    fontFamily: query.fontFamily || '\'Mona Sans\', \'Open Sans\', Verdana, Arial, sans-serif',
    margin: parseInt(query.margin || '20'),
    textOffset: parseInt(query.textOffset || '20'),
    limit: parseInt(query.limit || '100')
  };
};

const handleApiError = (c: Context, message: string, svgOptions: SvgOptions) => {
  console.error(message);
  c.res.headers.set('Content-Type', 'image/svg+xml');
  return c.body(createErrorSvg(message, svgOptions), 500);
};

app.get('/', (c) => {
  return c.json({ message: 'Hello Hono!' })
})

app.get('/sponsors/:author', async (c) => {
  const author = c.req.param('author')
  const options = parseOptions(c.req.query())

  const response = await fetch(`https://github-sponsors.as93.workers.dev/${author}`)
  if (!response.ok) {
    return handleApiError(c, `GitHub API returned a ${response.status} ${response.statusText || 'Unknown Error'}`, options);
  }
  const sponsors: User[] = await response.json()
  const svg = createSVG(sponsors, options)
  c.res.headers.set('Content-Type', 'image/svg+xml')
  return c.body(svg)
})

app.get('/contributors/:owner/:repo', async (c) => {
  const owner = c.req.param('owner');
  const repo = c.req.param('repo');
  const options = parseOptions(c.req.query());
  const headers: { Authorization?: string; } = {};

  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }

  const requestEndpoint = `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=${options.limit}`;

  const response = await fetch(requestEndpoint, { headers: headers })

  if (!response.ok) {
    return handleApiError(c, `GitHub API returned a ${response.status} ${response.statusText || 'Unknown Error'}`, options);
  }

  const contributors: User[] = (await response.json()).map((user: any) => ({
    login: user.login,
    name: user.name,
    avatarUrl: user.avatar_url
  }));

  const svg = createSVG(contributors, options);
  c.res.headers.set('Content-Type', 'image/svg+xml');
  return c.body(svg);

    
});

/**
 * Remove special characters from a string
 */
const escapeXml = (str: string) => {
  if (!str) return 'Unknown';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
};

const createErrorSvg = (message: string, options: SvgOptions) => {
  const { fontSize, backgroundColor, fontFamily } = options;
  return `
    <svg xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${backgroundColor}"/>
      <text
        x="50%"
        y="50%"
        font-family="${fontFamily}"
        font-size="${fontSize}"
        fill="#ff4d4f"
        text-anchor="middle"
        dominant-baseline="middle"
      >
        <tspan>${message}</tspan>
      </text>
    </svg>
  `;
};

/**
 * Given an array of GitHub users, and the SVG options, generate an SVG string.
 */
const createSVG = (users: User[], options: SvgOptions): string => {
  // User-specified SVG options
  const {
    title,
    avatarSize,
    perRow,
    shape,
    fontSize,
    textColor,
    backgroundColor,
    fontFamily,
    margin,
    textOffset,
    limit,
  } = options;

  // Derived values
  const maxTextWidth = avatarSize; // Max width of text to fit under the avatar
  const rowHeight = avatarSize + textOffset + margin; // Total height of a row
  const pathRounding = shape === 'circle' ? '50%' : (shape === 'squircle' ? '25%' : '0%');
  const titleFontSize = Number(fontSize) * 2; // Larger font size for the title
  const titleHeight = title ? titleFontSize * 1.5 : 0; // Additional height if there is a title
  const numberToDisplay = Number(limit > 0 ? limit : users.length);

  let svgContent = users.map((user, index) => {
    // Calculate x and y positions based on index, adjusted for title height if present
    let x = margin + (index % perRow) * (avatarSize + margin);
    let y = margin + Math.floor(index / perRow) * rowHeight + titleHeight;

    const escapedAvatarUrl = user.avatarUrl.replace(/&/g, '&amp;');
    let displayName = user.name || user.login; // Fallback to login if name is not available
    const escapedName = escapeXml(displayName);

    // Estimate text length and append ellipsis if it's likely to overflow
    const characterWidthEstimate = fontSize * 0.4; // Roughly estimate the width of a character
    const maxCharacters = Math.floor(maxTextWidth / characterWidthEstimate);
    if (escapedName.length > maxCharacters) {
      displayName = escapedName.substring(0, maxCharacters - 2) + '…'; // Truncate and add ellipsis
    }

    return `
      <image
        href="${escapedAvatarUrl}"
        x="${x}"
        y="${y}"
        height="${avatarSize}px"
        width="${avatarSize}px"
        clip-path="inset(0% round ${pathRounding})"
      />
      <text
        x="${x}"
        y="${y + avatarSize + textOffset}"
        font-family="${fontFamily}"
        font-size="${fontSize}px"
        fill="${textColor}"
      >
        ${displayName}
      </text>
    `;
  })
  .slice(0, numberToDisplay)
  .join('')

  // Title SVG element if title is specified
  const titleSvg = title ? `
    <text
      x="50%"
      y="${margin + fontSize}"
      font-family="${fontFamily}"
      font-size="${titleFontSize}px"
      fill="${textColor}"
      text-anchor="middle"
      dominant-baseline="middle"
    >
      ${escapeXml(title)}
    </text>
  ` : '';

  // Calculate the total height based on the number of users
  let totalRows = Math.ceil(users.length / perRow);
  let svgHeight = totalRows * rowHeight + margin + titleHeight;

  // Calculate the width of the SVG
  let svgWidth = perRow * (avatarSize + margin) + margin;

  return `
    <svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${backgroundColor}"/>
      ${titleSvg}
      ${svgContent}
    </svg>
  `;
}


export default handle(app)
