/**
 * Named backend URLs per APP_MODE — same pattern as greyon (D:\cambrix\greyon).
 * Switch hosts with VITE_APP_MODE=local|production in `.env`
 * (Vite has no Node `process` in the browser).
 * Optional VITE_ENGINE_URL overrides ENGINE_URL for one-off pointing.
 */

/** @typedef {'local' | 'production'} ApiMode */

/**
 * @typedef {object} ApiEndpoints
 * @property {string} ENGINE_URL myportfolio-engine origin (no trailing slash)
 */

const API_CONFIG = {
  local: {
    ENGINE_URL: 'https://myportfolio-engine.test',
  },
  production: {
    ENGINE_URL: 'https://myportfolio-engine.mxlab.site',
  },
}

const stripSlash = (url) => String(url || '').trim().replace(/\/+$/, '')

/** @returns {ApiMode} */
export function getApiMode() {
  const raw = String(import.meta.env.VITE_APP_MODE || (import.meta.env.DEV ? 'local' : 'production')).toLowerCase()
  if (raw === 'production' || raw === 'local') return raw
  return import.meta.env.DEV ? 'local' : 'production'
}

/** @returns {ApiEndpoints} */
export function getApiEndpoints() {
  const mode = getApiMode()
  const base = API_CONFIG[mode]
  const engineOverride = import.meta.env.VITE_ENGINE_URL || import.meta.env.VITE_API_URL
  return {
    ENGINE_URL: engineOverride?.trim() ? stripSlash(engineOverride) : base.ENGINE_URL,
  }
}

/** @deprecated prefer getApiEndpoints().ENGINE_URL */
export const API_URL = getApiEndpoints().ENGINE_URL

export const apiConfigured = Boolean(API_URL)

export default API_CONFIG
