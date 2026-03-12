/**
 * Readme Contribs - Badge Generator
 * Alpine.js application for generating embeddable GitHub badges
 */

import {
  buildFullUrl,
  DEMO_STARGAZERS_PATH,
  EXAMPLE_PATHS,
  IN_THE_WILD,
  loadAdvancedOptions,
  SUBMIT_REPO_URL,
} from './config.js'
import { sanitizeForUrl, showToast } from './utils.js'

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
    options: [], // Will be populated by loadAdvancedOptions()
    exampleIndex: -1,
    examplePaths: EXAMPLE_PATHS,
    exampleLoading: false,
    loadTimeout: null,
    exampleTimeout: null,
    demoTab: 0,
    demoLoading: false,
    demoLoaded: false,
    demoTimeout: null,
    inTheWild: IN_THE_WILD,
    submitRepoUrl: SUBMIT_REPO_URL,
    systemStatus: '',

    /**
     * Initialize the form - load advanced options from API
     */
    async init() {
      this.options = await loadAdvancedOptions()
      this.checkSystemStatus()
    },

    async checkSystemStatus() {
      try {
        const res = await fetch('/health')
        const data = await res.json()
        if (!data.hasToken) this.systemStatus = 'Missing token'
        else if (!data.authenticated) this.systemStatus = 'Expired/invalid token'
        else this.systemStatus = 'Healthy'
      } catch {
        this.systemStatus = 'Unreachable'
      }
    },

    setDemoTab(i) {
      this.demoTab = i
      if (i === 1 && !this.demoLoaded && !this.demoLoading) {
        this.loadStargazersDemo()
      }
    },

    loadStargazersDemo() {
      if (this.demoTimeout) {
        clearTimeout(this.demoTimeout)
      }
      this.demoLoading = true

      const demoUrl = buildFullUrl(DEMO_STARGAZERS_PATH)

      this.$nextTick(() => {
        const iframe = this.$refs.demoIframe
        if (!iframe) {
          this.demoLoading = false
          return
        }

        iframe.classList.remove('loaded')

        this.demoTimeout = setTimeout(() => {
          if (this.demoLoading) {
            this.demoLoading = false
            iframe.classList.add('loaded')
            showToast('Demo loading timeout - please try again', 'error')
          }
        }, 15000)

        iframe.onload = () => {
          if (this.demoTimeout) {
            clearTimeout(this.demoTimeout)
            this.demoTimeout = null
          }
          this.demoLoading = false
          this.demoLoaded = true
          try {
            const h = iframe.contentDocument.documentElement.scrollHeight
            if (h) iframe.style.height = `${h}px`
          } catch {
            /* cross-origin, keep aspect-ratio fallback */
          }
          setTimeout(() => {
            iframe.classList.add('loaded')
          }, 50)
        }

        iframe.onerror = () => {
          if (this.demoTimeout) {
            clearTimeout(this.demoTimeout)
            this.demoTimeout = null
          }
          this.demoLoading = false
          iframe.classList.add('loaded')
          showToast('Failed to load demo', 'error')
        }

        const cacheBuster = `${demoUrl.includes('?') ? '&' : '?'}_t=${Date.now()}`
        iframe.src = demoUrl + cacheBuster
      })
    },

    refreshDemo() {
      this.demoLoaded = false
      this.loadStargazersDemo()
    },

    /**
     * Toggles between different badge types
     * @param {string} formType - Type of badge (contributors, sponsors, stargazers, watchers, forkers, followers)
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
      const isValid =
        this.user &&
        (this.currentForm === 'sponsors' || this.currentForm === 'followers' || this.repo)

      if (!isValid) {
        this.showError = true
        // Announce error to screen readers
        const errorMessage = !this.user
          ? 'Please enter a GitHub username'
          : 'Please enter a repository name'
        showToast(errorMessage, 'error')
        return
      }

      // Clear any existing timeout
      if (this.loadTimeout) {
        clearTimeout(this.loadTimeout)
      }

      // Clear errors and show loading state
      this.showError = false
      this.loading = true
      this.showResults = true

      // Generate URL
      const newUrl = this.generatedUrl
      const urlToLoad =
        this.imageUrl === newUrl
          ? `${newUrl}${newUrl.includes('?') ? '&' : '?'}_t=${Date.now()}`
          : newUrl

      // Wait for Alpine to render the img/iframe element (if first time)
      this.$nextTick(() => {
        // Set timeout to prevent infinite loading (15 seconds)
        this.loadTimeout = setTimeout(() => {
          if (this.loading) {
            this.loading = false
            showToast('Loading timeout - please try again', 'error')
            console.error('Badge loading timeout after 15 seconds')
          }
        }, 15000)

        // Set the imageUrl to trigger load
        this.imageUrl = urlToLoad
      })
    },

    /**
     * Handles successful load of badge image/iframe
     */
    handleLoadSuccess() {
      if (this.loadTimeout) {
        clearTimeout(this.loadTimeout)
        this.loadTimeout = null
      }
      this.loading = false
    },

    /**
     * Handles error loading badge image/iframe
     */
    handleLoadError() {
      // Only show error if we were actually trying to load something
      if (!this.loading) {
        return
      }

      if (this.loadTimeout) {
        clearTimeout(this.loadTimeout)
        this.loadTimeout = null
      }
      this.loading = false
      showToast('Failed to load badge - please check your inputs', 'error')
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
    generateSnippet(format, asLink = false) {
      const url = this.generatedUrl
      const alt = `${this.currentForm} badge`
      const link = asLink ? this.linkUrl : ''

      switch (format) {
        case 'Markdown':
          return link ? `[![${alt}](${url})](${link})` : `![${alt}](${url})`
        case 'HTML Image':
          return link
            ? `<a href="${link}"><img src="${url}" alt="${alt}"></a>`
            : `<img src="${url}" alt="${alt}">`
        case 'HTML Embed':
          return `<iframe src="${url}" title="${this.currentForm}"></iframe>`
        case 'BB Code':
          return link ? `[url=${link}][img]${url}[/img][/url]` : `[img]${url}[/img]`
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
      // Clear any existing timeout
      if (this.exampleTimeout) {
        clearTimeout(this.exampleTimeout)
      }

      // Show loading animation
      this.exampleLoading = true

      // Cycle through examples
      this.exampleIndex = (this.exampleIndex + 1) % this.examplePaths.length
      const examplePath = this.examplePaths[this.exampleIndex]
      const exampleUrl = buildFullUrl(examplePath)

      // Wait for Alpine to render the iframe (if first time)
      this.$nextTick(() => {
        const iframe = this.$refs.exampleIframe

        if (!iframe) {
          console.error('Example iframe not found')
          this.exampleLoading = false
          return
        }

        // Hide current iframe
        iframe.classList.remove('loaded')

        // Set timeout to prevent infinite loading (15 seconds for first load)
        this.exampleTimeout = setTimeout(() => {
          if (this.exampleLoading) {
            this.exampleLoading = false
            iframe.classList.add('loaded')
            showToast('Example loading timeout - please try again', 'error')
            console.error('Example loading timeout after 15 seconds')
          }
        }, 15000)

        // Force reload by adding timestamp
        const cacheBuster = `${exampleUrl.includes('?') ? '&' : '?'}_t=${Date.now()}`
        iframe.className = `example-${this.exampleIndex + 1}`

        // Set up event handlers BEFORE setting src
        iframe.onload = () => {
          if (this.exampleTimeout) {
            clearTimeout(this.exampleTimeout)
            this.exampleTimeout = null
          }
          this.exampleLoading = false
          // Small delay before showing to ensure smooth transition
          setTimeout(() => {
            iframe.classList.add('loaded')
          }, 50)
        }

        // Handle load errors
        iframe.onerror = (e) => {
          console.error('Example iframe failed to load:', e)
          if (this.exampleTimeout) {
            clearTimeout(this.exampleTimeout)
            this.exampleTimeout = null
          }
          this.exampleLoading = false
          iframe.classList.add('loaded')
          showToast('Failed to load example', 'error')
        }

        // Set src AFTER event handlers are attached
        iframe.src = exampleUrl + cacheBuster
      })
    },

    /**
     * Generates the final badge URL with all parameters
     * @returns {string} Complete badge URL
     */
    get generatedUrl() {
      // Use current host and protocol
      const protocol = window.location.protocol
      const host = window.location.host

      // Build base URL
      const sanitizedUser = this.user ? sanitizeForUrl(this.user) : '[username]'
      let baseUrl = `${protocol}//${host}/${this.currentForm}/${sanitizedUser}`

      // Add repository for badges that require it (not sponsors or followers)
      if (this.currentForm !== 'sponsors' && this.currentForm !== 'followers') {
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

    get linkUrl() {
      const u = this.user ? sanitizeForUrl(this.user) : '[username]'
      const r = this.repo ? sanitizeForUrl(this.repo) : '[repo]'
      const paths = {
        sponsors: `sponsors/${u}`,
        contributors: `${u}/${r}/graphs/contributors`,
        stargazers: `${u}/${r}/stargazers`,
        watchers: `${u}/${r}/watchers`,
        forkers: `${u}/${r}/forks`,
        followers: `${u}?tab=followers`,
      }
      return `https://github.com/${paths[this.currentForm]}`
    },
  }
}

// Make function available globally for Alpine.js
window.apiForm = apiForm
