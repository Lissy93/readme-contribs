/**
 * Utility Functions
 * Shared helper functions for the application
 */

/**
 * Sanitizes a string for use in URLs
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeForUrl(str) {
  if (typeof str !== 'string') return ''
  // Remove # prefix from colors
  return str.replace(/^#/, '').trim()
}

/**
 * Shows a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of notification ('success' | 'error')
 */
export function showToast(message, type = 'success') {
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

// Add toast animations if not already present
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
