/**
 * Axios client factory (IBPF / greyon createApiClient pattern).
 * Bearer token from localStorage for Sanctum admin routes.
 */
import axios from 'axios'

export class ApiError extends Error {
  constructor(message, status = 0, errors = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

const friendly = {
  0: 'Could not reach the server. Check your connection and try again.',
  401: 'Your session has expired. Please sign in again.',
  403: 'You do not have access to this.',
  404: 'That request no longer exists.',
  419: 'Your session has expired. Please sign in again.',
  422: 'Please check the highlighted fields.',
  429: 'Too many attempts. Please wait a minute and try again.',
  500: 'The server had a problem. Please try again shortly.',
}

let onUnauthorized = () => {}
let unauthorizedHandling = false

/** Register a global 401 handler (wired from admin layout). */
export function setUnauthorizedHandler(fn) {
  onUnauthorized = typeof fn === 'function' ? fn : () => {}
}

function notifyUnauthorized() {
  if (unauthorizedHandling) return
  unauthorizedHandling = true
  try {
    onUnauthorized()
  } finally {
    window.setTimeout(() => {
      unauthorizedHandling = false
    }, 1500)
  }
}

function messageFromBody(status, data) {
  if (data && typeof data.message === 'string' && data.message.length < 200 && status < 500) {
    return data.message
  }
  return friendly[status] || (status >= 500 ? friendly[500] : 'Something went wrong. Please try again.')
}

/**
 * @param {string} baseURL engine origin, e.g. https://myportfolio-engine.test
 * @param {{ bearerStorageKey?: string | null }} [options]
 */
export function createApiClient(baseURL, options = {}) {
  const { bearerStorageKey = 'admin_token' } = options
  const root = String(baseURL || '').replace(/\/+$/, '')

  const client = axios.create({
    baseURL: `${root}/api`,
    headers: {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
  })

  client.interceptors.request.use((config) => {
    if (config.skipAuth) {
      if (config.headers) delete config.headers.Authorization
      return config
    }
    if (bearerStorageKey && typeof localStorage !== 'undefined') {
      try {
        const token = localStorage.getItem(bearerStorageKey)
        if (token) {
          config.headers = config.headers || {}
          config.headers.Authorization = `Bearer ${token}`
        }
      } catch {
        /* ignore */
      }
    }
    return config
  })

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (!axios.isAxiosError(error)) {
        return Promise.reject(new ApiError(friendly[0], 0))
      }
      if (!error.response) {
        return Promise.reject(new ApiError(friendly[0], 0))
      }

      const status = error.response.status
      const data = error.response.data
      const errors = data?.errors && typeof data.errors === 'object' ? data.errors : {}

      if (status === 401 && bearerStorageKey) {
        try {
          localStorage.removeItem(bearerStorageKey)
        } catch {
          /* ignore */
        }
        const path = String(error.config?.url || '')
        if (!path.includes('/admin/login')) notifyUnauthorized()
      }

      return Promise.reject(new ApiError(messageFromBody(status, data), status, errors))
    },
  )

  return client
}
