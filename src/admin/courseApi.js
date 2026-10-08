// Course / module / cohort / enquiry admin calls. Contracts mirror the engine's
// Admin\CourseController + Admin\CourseEnquiryController (Laravel, Sanctum bearer).
import { api } from './api.js'
import { PAYMENT_FIELDS, formatMoney } from '../data/paymentOptions.js'

export { PAYMENT_FIELDS }

export const COHORT_STATUSES = ['draft', 'open', 'full', 'closed']
export const COHORT_FORMATS = ['online', 'in_person', 'hybrid']
export const ENQUIRY_STATUSES = ['new', 'contacted', 'enrolled', 'declined']
export const CURRENCIES = ['USD', 'KHR']
export const FORMAT_LABEL = { online: 'Online', in_person: 'In person', hybrid: 'Hybrid' }

const unwrap = (res) => res?.data ?? res

export const listCourses = async () => unwrap(await api('/admin/courses')) || []
export const getCourse = async (id) => unwrap(await api(`/admin/courses/${id}`))
export const createCourse = async (body) => unwrap(await api('/admin/courses', { method: 'POST', body }))
export const updateCourse = async (id, body) => unwrap(await api(`/admin/courses/${id}`, { method: 'PATCH', body }))
export const deleteCourse = (id) => api(`/admin/courses/${id}`, { method: 'DELETE' })

export const createModule = async (courseId, body) =>
  unwrap(await api(`/admin/courses/${courseId}/modules`, { method: 'POST', body }))
export const updateModule = async (courseId, id, body) =>
  unwrap(await api(`/admin/courses/${courseId}/modules/${id}`, { method: 'PATCH', body }))
export const deleteModule = (courseId, id) => api(`/admin/courses/${courseId}/modules/${id}`, { method: 'DELETE' })
export const reorderModules = async (courseId, order) =>
  unwrap(await api(`/admin/courses/${courseId}/modules/reorder`, { method: 'PATCH', body: { order } }))

export const createCohort = async (courseId, body) =>
  unwrap(await api(`/admin/courses/${courseId}/cohorts`, { method: 'POST', body }))
export const updateCohort = async (courseId, id, body) =>
  unwrap(await api(`/admin/courses/${courseId}/cohorts/${id}`, { method: 'PATCH', body }))
export const deleteCohort = (courseId, id) => api(`/admin/courses/${courseId}/cohorts/${id}`, { method: 'DELETE' })

/** Fetch every page of enquiries for the given filters (engine paginates by 20). */
export async function listEnquiries(params = {}) {
  const rows = []
  for (let page = 1; page <= 20; page++) {
    const p = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => v !== '' && v != null && p.set(k, v))
    p.set('page', page)
    const res = await api(`/admin/course-enquiries?${p}`)
    rows.push(...(res.data || []))
    if (!res.last_page || page >= res.last_page) break
  }
  return rows
}
export const updateEnquiry = async (id, body) =>
  unwrap(await api(`/admin/course-enquiries/${id}`, { method: 'PATCH', body }))

/** The engine's UpdateCourseEnquiryRequest only validates status + admin_note, so cohort_id is dropped. */
export const ENQUIRY_ACCEPTS_COHORT_ID = false

/**
 * Cohort payment options (installment_count/amount, deposit_amount, early_bird_price/until/seats,
 * referral_discount). The engine's Store/UpdateCohortRequest don't list them yet, but both
 * controller actions save `$request->validated()` only, so unknown keys are dropped silently
 * (no 422). Sending them is therefore harmless, and they start saving as soon as the backend
 * migration + validation land (see BACKEND-PAYMENT-OPTIONS.md). Set to false to stop sending.
 */
export const COHORT_ACCEPTS_PAYMENT_OPTIONS = true

/** True when a cohort from the API carries the payment fields (i.e. the engine stores them). */
export const hasPaymentFields = (c) => !!c && PAYMENT_FIELDS.some((k) => Object.prototype.hasOwnProperty.call(c, k))

/** Only the payment keys the cohort actually has (for full-object PATCH bodies). */
export function pickPaymentFields(c) {
  const out = {}
  PAYMENT_FIELDS.forEach((k) => { if (c && Object.prototype.hasOwnProperty.call(c, k)) out[k] = c[k] })
  return out
}

/** Laravel 422 `errors` → { field: 'first message' } (nested keys like languages.0 → languages). */
export function fieldErrors(e) {
  const out = {}
  Object.entries(e?.errors || {}).forEach(([k, v]) => {
    const key = k.split('.')[0]
    if (!out[key]) out[key] = Array.isArray(v) ? v[0] : String(v)
  })
  return out
}

export const slugify = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 180)

/** Confirmed seats = seats − seats_left (engine counts status=enrolled only). */
export const confirmedSeats = (c) => Math.max(0, (Number(c.seats) || 0) - (Number(c.seats_left) || 0))

export function formatPrice(c) {
  if (c.price === null || c.price === undefined || c.price === '') return 'Price on request'
  return formatMoney(c.price, c.currency || 'USD') || 'Price on request'
}

export const fmtDate = (iso) =>
  iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
