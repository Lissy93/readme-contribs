/**
 * Readme Contribs - Badge Generator
 * Alpine.js application for generating embeddable GitHub badges
 */

/**
 * Sanitizes a string for use in URLs
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeForUrl(str) {
  if (typeof str !== 'string') return ''
  // Remove # prefix from colors
  return str.replace(/^#/, '').trim()
}

/**
 * Shows a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of notification ('success' | 'error')
 */
function showToast(message, type = 'success') {
  // Create toast element
  const toast = document.createElement('div')
  toast.className = `toast toast-${type}`
  toast.textContent = message
  toast.setAttribute('role', 'status')
  toast.setAttribute('aria-live', 'polite')

  // Style the toast
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    padding: '12px 20px',
    background: type === 'success' ? '#48c774' : '#f14668',
    color: 'white',
    borderRadius: '6px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    zIndex: '10000',
    animation: 'slideIn 0.3s ease-out',
    maxWidth: '300px',
  })

  // Add to DOM
  document.body.appendChild(toast)

  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out'
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}

// Add toast animations
if (!document.querySelector('#toast-animations')) {
  const style = document.createElement('style')
  style.id = 'toast-animations'
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `
  document.head.appendChild(style)
}

/**
 * Configuration for example badges
 */
const EXAMPLES = [
  'https://readme-contribs.as93.net/forkers/Lissy93/AdGuardian-Term?title=AdGuardian%20Forkers&textColor=bfbfbf&isResponsive=true&dynamic=true&outerBorderWidth=2&outerBorderRadius=5&footerText=none',
  'https://readme-contribs.as93.net/sponsors/lissy93?shape=squircle&dynamic=true&margin=16&textOffset=8&perRow=6&title=@Lissy93%27s%20Sponsors&textColor=white&isResponsive=true&backgroundColor=black&fontFamily=Courier%20New&fontSize=8&footerText=none',
  "https://readme-contribs.as93.net/stargazers/lissy93/web-check?shape=square&margin=16&perRow=15&title=Web-Check's Stargazers&textColor=9fef00&isResponsive=true&backgroundColor=101215&fontFamily=cursive&fontSize=14&limit=90&footerText=none",
  'https://readme-contribs.as93.net/contributors/lissy93/dashy?shape=squircle&perRow=10&title=Lissy93%2FDashy%27s%20Top%20Contributors&textColor=black&isResponsive=true&backgroundColor=00d1b2&margin=6&hideLabel=true&textOffset=2&footerText=none',
  'https://readme-contribs.as93.net/stargazers/steverichey/hot-dog-stand?backgroundColor=red&textColor=yellow&outerBorderWidth=5&outerBorderRadius=8&fontFamily=Comic Sans&fontSize=12&avatarSize=64&perRow=4&title=SteveRichey/Hot-Dog-Stand&isResponsive=true&dynamic=true&footerText=none&shape=circle',
  'https://readme-contribs.as93.net/contributors/rust-lang/rust?hideLabel=true&margin=2&textOffset=0&perRow=10&title=Rust%20Lang%20Top%20Contributors&isResponsive=true&dynamic=true&footerText=none',
]

/**
 * Advanced configuration options
 * NOTE: This file is deprecated and not currently used.
 * The active implementation uses app.js which loads options from /api/params
 */

/**
 * Main Alpine.js application
 * @returns {object} Alpine.js reactive data and methods
 */
function apiForm() {
  return {
    // State
    currentForm: 'contributors',
    showAdvancedOptions: false,
    showResults: false,
    loading: false,
    imageUrl: '',
    user: '',
    repo: '',
    outputMode: false, // false = static, true = dynamic
    showError: false,
    options: ADVANCED_OPTIONS,
    exampleIndex: -1,
    examples: EXAMPLES,

    /**
     * Toggles between different badge types
     * @param {string} formType - Type of badge (contributors, sponsors, stargazers, forkers)
     */
    toggleForm(formType) {
      this.currentForm = formType
      this.showResults = false
      this.loading = false
      this.showError = false
    },

    /**
     * Validates and submits the form
     */
    submitForm() {
      // Validate required fields
      const isValid = this.user && (this.currentForm === 'sponsors' || this.repo)

      if (!isValid) {
        this.showError = true
        // Announce error to screen readers
        const errorMessage = !this.user
          ? 'Please enter a GitHub username'
          : 'Please enter a repository name'
        showToast(errorMessage, 'error')
        return
      }

      // Clear errors and show loading state
      this.showError = false
      this.loading = true
      this.imageUrl = this.generatedUrl
      this.showResults = true
    },

    /**
     * Copies text to clipboard
     * @param {string} text - Text to copy
     */
    async copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text)
        showToast('Copied to clipboard!', 'success')
      } catch (err) {
        console.error('Failed to copy:', err)
        showToast('Failed to copy to clipboard', 'error')

        // Fallback for older browsers
        try {
          const textArea = document.createElement('textarea')
          textArea.value = text
          textArea.style.position = 'fixed'
          textArea.style.opacity = '0'
          document.body.appendChild(textArea)
          textArea.select()
          document.execCommand('copy')
          document.body.removeChild(textArea)
          showToast('Copied to clipboard!', 'success')
        } catch (fallbackErr) {
          console.error('Fallback copy failed:', fallbackErr)
        }
      }
    },

    /**
     * Generates code snippet in specified format
     * @param {string} format - Format type (Markdown, HTML Image, etc.)
     * @returns {string} Formatted code snippet
     */
    generateSnippet(format) {
      const url = this.generatedUrl
      const alt = `${this.currentForm} badge`

      switch (format) {
        case 'Markdown':
          return `![${alt}](${url})`
        case 'HTML Image':
          return `<img src="${url}" alt="${alt}">`
        case 'HTML Embed':
          return `<iframe src="${url}" title="${this.currentForm}"></iframe>`
        case 'BB Code':
          return `[img]${url}[/img]`
        case 'Direct Link':
          return url
        default:
          return ''
      }
    },

    /**
     * Shows a random example badge
     */
    showExample() {
      const frameLoader = document.getElementById('load-frame')
      const iframe = document.querySelector('.example-grid iframe')

      if (!frameLoader || !iframe) return

      // Show loading indicator
      frameLoader.style.display = 'block'
      iframe.style.display = 'none'

      // Cycle through examples
      this.exampleIndex = (this.exampleIndex + 1) % this.examples.length
      iframe.src = this.examples[this.exampleIndex]
      iframe.className = `example-${this.exampleIndex + 1}`

      // Hide loading when loaded
      iframe.onload = () => {
        frameLoader.style.display = 'none'
        iframe.style.display = 'block'
      }

      // Handle load errors
      iframe.onerror = () => {
        frameLoader.style.display = 'none'
        showToast('Failed to load example', 'error')
      }
    },

    /**
     * Generates the final badge URL with all parameters
     * @returns {string} Complete badge URL
     */
    get generatedUrl() {
      // Determine host (use production URL in development)
      const host =
        window.location.hostname === 'localhost' ? 'readme-contribs.as93.net' : window.location.host

      // Build base URL
      const sanitizedUser = this.user ? sanitizeForUrl(this.user) : '[username]'
      let baseUrl = `https://${host}/${this.currentForm}/${sanitizedUser}`

      // Add repository for non-sponsor badges
      if (this.currentForm !== 'sponsors') {
        const sanitizedRepo = this.repo ? sanitizeForUrl(this.repo) : '[repo]'
        baseUrl += `/${sanitizedRepo}`
      }

      // Build query parameters from options
      const queryParams = this.options
        .filter((option) => option.value && option.value.trim() !== '')
        .map((option) => {
          const sanitizedValue = sanitizeForUrl(option.value)
          return `${option.name}=${encodeURIComponent(sanitizedValue)}`
        })
        .join('&')

      return queryParams ? `${baseUrl}?${queryParams}` : baseUrl
    },
  }
}

// Make function available globally for Alpine.js
window.apiForm = apiForm
