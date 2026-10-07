import { getApiEndpoints } from '@/helpers/api/apiConfig.js'
import { createApiClient } from '@/helpers/api/createApiClient.js'

const endpoints = getApiEndpoints()

/** myportfolio-engine JSON API (Sanctum bearer for /admin/*) */
export const engineAPI = createApiClient(endpoints.ENGINE_URL)

export { endpoints }
