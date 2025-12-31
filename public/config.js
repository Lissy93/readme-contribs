/**
 * Configuration Constants
 * Application-wide constants and configuration
 */

/**
 * Example badge paths for demonstration (without host/protocol)
 * These will be prefixed with the current origin at runtime
 */
export const EXAMPLE_PATHS = [
  '/sponsors/lissy93?shape=squircle&dynamic=true&margin=16&textOffset=8&perRow=6&title=@Lissy93%27s%20Sponsors&textColor=white&isResponsive=true&backgroundColor=black&fontFamily=Courier%20New&fontSize=8&footerText=none',
  '/stargazers/lissy93/web-check?shape=square&margin=16&perRow=15&title=Web-Check%27s%20Stargazers&textColor=9fef00&isResponsive=true&backgroundColor=101215&fontFamily=cursive&fontSize=14&limit=90&footerText=none',
  '/contributors/lissy93/dashy?shape=squircle&perRow=10&title=Lissy93%2FDashy%27s%20Top%20Contributors&textColor=black&isResponsive=true&backgroundColor=00d1b2&margin=6&hideLabel=true&textOffset=2&footerText=none',
  '/watchers/vercel/next.js?shape=circle&perRow=8&title=Next.js%20Watchers&textColor=white&isResponsive=true&backgroundColor=000000&fontFamily=Arial&fontSize=12&dynamic=true&footerText=none',
  '/followers/torvalds?shape=squircle&perRow=16&limit=96&title=Linus%20Torvalds%27%20Followers&textColor=333333&isResponsive=true&backgroundColor=f5f5f5&margin=10&dynamic=true&footerText=none',
  '/stargazers/steverichey/hot-dog-stand?backgroundColor=red&textColor=FFDE21&outerBorderWidth=5&outerBorderRadius=8&fontFamily=Comic Sans&fontSize=12&avatarSize=64&perRow=4&title=SteveRichey/Hot-Dog-Stand&isResponsive=true&dynamic=true&footerText=none&shape=circle',
  '/forkers/Lissy93/AdGuardian-Term?title=AdGuardian%20Forkers&textColor=bfbfbf&isResponsive=true&dynamic=true&outerBorderWidth=2&outerBorderRadius=5&footerText=none',
  '/contributors/rust-lang/rust?hideLabel=true&margin=2&textOffset=0&perRow=10&title=Rust%20Lang%20Top%20Contributors&isResponsive=true&dynamic=true&footerText=none',
]

/**
 * Builds a full URL from a path using the current origin
 * @param {string} path - Path starting with /
 * @returns {string} Full URL with current protocol and host
 */
export const buildFullUrl = (path) => {
  return `${window.location.origin}${path}`
}

/**
 * Advanced configuration options for badge generation
 */
export const ADVANCED_OPTIONS = [
  { name: 'title', value: '', label: 'Title', placeholder: 'Enter title' },
  { name: 'avatarSize', value: '', label: 'Avatar Size', placeholder: '80' },
  { name: 'perRow', value: '', label: 'Per Row', placeholder: 'Number per row' },
  { name: 'shape', value: '', label: 'Shape', placeholder: 'circle, square, or squircle' },
  { name: 'fontSize', value: '', label: 'Font Size', placeholder: '16' },
  { name: 'textColor', value: '', label: 'Text Color', placeholder: 'e.g., black, #333' },
  {
    name: 'backgroundColor',
    value: '',
    label: 'Background Color',
    placeholder: 'e.g., white, #fff',
  },
  { name: 'fontFamily', value: '', label: 'Font Family', placeholder: 'e.g., Arial' },
  { name: 'margin', value: '', label: 'Margin', placeholder: '35' },
  { name: 'textOffset', value: '', label: 'Text Offset', placeholder: 'Offset for text' },
  { name: 'limit', value: '', label: 'Limit', placeholder: 'Limit number displayed' },
]
