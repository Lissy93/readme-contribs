import type { SvgOptions, User } from './types'

/**
 * Returns an SVG to display an error message
 */
export const createErrorSVG = (message: string, options: SvgOptions) => {
  const { fontSize, backgroundColor, fontFamily } = options
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
  `
}

// Utility function to handle concurrency
async function processWithConcurrency<T, U>(
  items: T[],
  worker: (item: T) => Promise<U>,
  concurrency: number
): Promise<U[]> {
  const results: U[] = new Array(items.length)
  const executing = new Set<Promise<void>>()
  const executingPromises = new Map<T, Promise<void>>()

  const executeTask = async (item: T, index: number) => {
    try {
      results[index] = await worker(item)
    } catch (error) {
      console.error(`Error processing item at index ${index}: ${error}`)
      results[index] = null as U
    } finally {
      const task = executingPromises.get(item)
      if (task) {
        executing.delete(task)
      }
    }
  }

  for (let i = 0; i < items.length; i++) {
    const task = executeTask(items[i], i)
    executingPromises.set(items[i], task)
    executing.add(task)

    if (executing.size >= concurrency) {
      await Promise.race(executing)
    }
  }

  await Promise.all(executing)
  return results
}

const escapeXml = (str: string): string => {
  if (!str) return 'Unknown'
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

const parseColor = (color: string, hasTransparency: boolean = false): string => {
  if (!color) return 'transparent'
  const alpha = hasTransparency ? '80' : ''
  return color.match(/^#?[0-9A-Fa-f]{6}$/) ? `#${color}${alpha}` : color
}

async function fetchAndEncodeImage(url: string): Promise<string> {
  const fetchUrl = `${url}&size=50`
  try {
    const response = await fetch(fetchUrl)
    if (!response.ok)
      throw new Error(`Failed to fetch the image from ${url}: ${response.statusText}`)
    const arrayBuffer = await response.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
    const mimeType = response.headers.get('content-type') || 'image/png'
    return `data:${mimeType};base64,${base64}`
  } catch (error) {
    console.error(`Error fetching image: ${error}`)
    return ''
  }
}

export const createUserSVG = async (users: User[], options: SvgOptions): Promise<string> => {
  const {
    title,
    avatarSize,
    perRow,
    shape,
    hideLabel,
    fontSize,
    textColor,
    backgroundColor,
    fontFamily,
    margin,
    textOffset,
    limit,
    dynamic,
    isResponsive,
    outerBorderWidth,
    outerBorderColor,
    outerBorderRadius,
    footerText: customFooterText,
    svgWidth: customSvgWidth,
    svgHeight: customSvgHeight,
  } = options

  const maxTextWidth = avatarSize
  const rowHeight = avatarSize + textOffset + margin
  const pathRounding = shape === 'circle' ? '50%' : shape === 'squircle' ? '25%' : '0%'
  const titleFontSize = fontSize * 2
  const titleHeight = title ? fontSize * 3 : 0
  const numberToDisplay = Math.min(limit, users.length)
  const footerText = customFooterText || process.env.FOOTER_TEXT || ''

  const totalRows = Math.ceil(numberToDisplay / perRow)
  const svgHeight = customSvgHeight || totalRows * rowHeight + margin + titleHeight
  const svgWidth = customSvgWidth || perRow * (avatarSize + margin) + margin
  const viewBox = `0 0 ${svgWidth} ${svgHeight}`

  // Controlled concurrency for image fetching
  const encodedImages = dynamic
    ? []
    : await processWithConcurrency(
        users.slice(0, numberToDisplay).map((user: User) => user.avatarUrl),
        fetchAndEncodeImage,
        5 // concurrency level
      )

  const svgContent = users
    .map((user, index) => {
      if (index >= numberToDisplay) return ''
      const x = margin + (index % perRow) * (avatarSize + margin)
      const y = margin + Math.floor(index / perRow) * rowHeight + titleHeight
      const profileUrl = `https://github.com/${user.login}`
      const imageSrc = encodedImages[index]
      let displayName = escapeXml(user.name || user.login || 'Unknown')
      const escapedAvatarUrl = escapeXml(user.avatarUrl)

      const characterWidthEstimate = fontSize * 0.4
      const maxCharacters = Math.floor(maxTextWidth / characterWidthEstimate)
      if (displayName.length > maxCharacters) {
        displayName = `${displayName.substring(0, maxCharacters - 2)}…`
      }

      const text = hideLabel
        ? ''
        : `
      <text
        x="${x}"
        y="${y + avatarSize + textOffset}"
        font-family="${fontFamily}"
        font-size="${fontSize}px"
        fill="${parseColor(textColor)}"
      >
        ${displayName}
      </text>
    `

      return `
      <a xlink:href="${profileUrl}" target="_blank">
        <image
          ${dynamic ? `href="${escapedAvatarUrl}"` : ''}
          xlink:href="${imageSrc}"
          x="${x}"
          y="${y}"
          height="${avatarSize}px"
          width="${avatarSize}px"
          clip-path="inset(0% round ${pathRounding})"
        />
        ${text}
      </a>
    `
    })
    .join('')

  const titleSvg = title
    ? `
    <text
      x="50%"
      y="${margin + fontSize * 1.5}"
      font-family="${fontFamily}"
      font-size="${titleFontSize}px"
      fill="${parseColor(textColor)}"
      text-anchor="middle"
      dominant-baseline="middle"
    >
      ${escapeXml(title)}
    </text>
  `
    : ''

  const footerTextSvg =
    footerText && footerText !== 'none'
      ? `
    <text
      x="${svgWidth - margin}" y="${svgHeight - 5}"
      font-family="${fontFamily}" font-size="${fontSize * 0.8}px"
      fill="${parseColor(textColor, true)}" text-anchor="end"
    >
      ${escapeXml(footerText)}
    </text>
  `
      : ''

  return `
    <svg 
      width="${isResponsive ? '100%' : `${svgWidth}px`}" 
      height="${isResponsive ? '100%' : `${svgHeight}px`}"
      viewBox="${isResponsive ? viewBox : ''}"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg" 
      xmlns:xlink="http://www.w3.org/1999/xlink">
      <rect
        width="100%" height="100%"
        fill="${parseColor(backgroundColor)}"
        stroke="${parseColor(outerBorderColor || textColor)}"
        stroke-width="${outerBorderWidth}px"
        rx="${outerBorderRadius}px" />
      ${title ? titleSvg : ''}
      ${svgContent}
      ${footerTextSvg}
    </svg>
  `
}
