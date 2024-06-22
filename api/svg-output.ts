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
