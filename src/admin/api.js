// Tiny client for the myportfolio-engine admin API (Sanctum bearer token).
// The token lives in localStorage — see README "Admin area" for the trade-off.
export const API_URL = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '')
export const apiConfigured = Boolean(API_URL)

const TOKEN_KEY = 'admin_token'

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

export class ApiError extends Error {
  constructor(message, status = 0, errors = {}) {
    super(message)
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
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn
}

export async function api(path, { method = 'GET', body, raw = false, auth = true } = {}) {
  if (!apiConfigured) {
    throw new ApiError('The admin API is not configured (VITE_API_URL is empty).')
  }
  const headers = { Accept: raw ? 'text/csv, application/json' : 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (auth && token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(`${API_URL}/api${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(friendly[0], 0)
  }

  if (res.ok && raw) return res
  let data = null
  try {
    data = await res.json()
  } catch {
    /* non-JSON body */
  }
  if (res.ok) return data

  if (res.status === 401 && auth) {
    clearToken()
    onUnauthorized()
  }
  const message =
    (typeof data?.message === 'string' && data.message.length < 200 && res.status < 500 && data.message) ||
    friendly[res.status] ||
    (res.status >= 500 ? friendly[500] : 'Something went wrong. Please try again.')
  throw new ApiError(message, res.status, data?.errors || {})
}
