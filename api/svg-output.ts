import type { User, SvgOptions } from './types'

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

/**
 * Returns an SVG to display an error message
 */
export const createErrorSVG = (message: string, options: SvgOptions) => {
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
export const createUserSVG = (users: User[], options: SvgOptions): string => {
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

  const maxTextWidth = avatarSize;
  const rowHeight = avatarSize + textOffset + margin;
  const pathRounding = shape === 'circle' ? '50%' : (shape === 'squircle' ? '25%' : '0%');
  const titleFontSize = Number(fontSize) * 2;
  const titleHeight = title ? titleFontSize * 1.5 : 0;
  const numberToDisplay = Number(limit > 0 ? limit : users.length);

  let svgContent = users.map((user, index) => {
    let x = margin + (index % perRow) * (avatarSize + margin);
    let y = margin + Math.floor(index / perRow) * rowHeight + titleHeight;
    const profileUrl = `https://github.com/${user.login}`;
    const escapedAvatarUrl = user.avatarUrl.replace(/&/g, '&amp;');
    let displayName = user.name || user.login;
    const escapedName = escapeXml(displayName);

    const characterWidthEstimate = fontSize * 0.4;
    const maxCharacters = Math.floor(maxTextWidth / characterWidthEstimate);
    if (escapedName.length > maxCharacters) {
      displayName = escapedName.substring(0, maxCharacters - 2) + '…';
    }

    return `
      <a xlink:href="${profileUrl}" target="_blank">
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
      </a>
    `;
  })
  .slice(0, numberToDisplay)
  .join('')

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

  let totalRows = Math.ceil(users.length / perRow);
  let svgHeight = totalRows * rowHeight + margin + titleHeight;
  let svgWidth = perRow * (avatarSize + margin) + margin;

  return `
    <svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <rect width="100%" height="100%" fill="${backgroundColor}"/>
      ${titleSvg}
      ${svgContent}
    </svg>
  `;
}
