// Thin admin helpers on top of the shared axios engine client (see helpers/api).
import { apiConfigured, API_URL, engineAPI, ApiError, setUnauthorizedHandler } from '@/helpers/api'

export { apiConfigured, API_URL, ApiError, setUnauthorizedHandler }

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

/**
 * Admin fetch helper — same shape as before, now powered by axios `engineAPI`.
 * @param {string} path path under /api, e.g. `/admin/me`
 * @param {{ method?: string, body?: unknown, raw?: boolean, auth?: boolean }} [opts]
 */
export async function api(path, { method = 'GET', body, raw = false, auth = true } = {}) {
  if (!apiConfigured) {
    throw new ApiError('The admin API is not configured.')
  }

  try {
    const response = await engineAPI.request({
      url: path,
      method,
      data: body,
      responseType: raw ? 'blob' : 'json',
      skipAuth: !auth,
    })

    if (raw) {
      // Match the old fetch Response shape used by CSV export (`res.blob()`).
      return {
        ok: true,
        status: response.status,
        headers: response.headers,
        blob: async () => response.data,
        data: response.data,
      }
    }
    return response.data
  } catch (e) {
    if (e instanceof ApiError) throw e
    throw new ApiError(e?.message || 'Something went wrong. Please try again.', e?.status || 0, e?.errors || {})
  }
}
