import { reactive } from 'vue'

export const toasts = reactive([])
let seq = 0
export function toast(message, type = 'ok', ms = 3200) {
  const id = ++seq
  toasts.push({ id, message, type })
  setTimeout(() => {
    const i = toasts.findIndex((t) => t.id === id)
    if (i !== -1) toasts.splice(i, 1)
  }, ms)
}
/** Show an ApiError as a toast unless it's a 401 (the layout already redirects to login). */
export function toastError(e, fallback = 'Something went wrong.') {
  if (e?.status === 401) return
  toast(e?.status === 422 ? 'Please fix the highlighted fields.' : e?.message || fallback, 'error', 4500)
}
