// Payment options per class (cohort): monthly installments, seat deposit, early bird, refer a friend.
// Everything is optional and set by Max in the admin — nothing here holds a real amount.
// All amounts use the class currency. Every helper tolerates missing / null fields because
// older engine builds don't send them yet; in that case the options simply don't render.

export const PAYMENT_FIELDS = [
  'installment_count',
  'installment_amount',
  'deposit_amount',
  'early_bird_price',
  'early_bird_until',
  'early_bird_seats',
  'referral_discount',
]

/** Number or null (null / '' / NaN → null). */
export const num = (v) => {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

/** $180 · $70.50 · 720,000 ៛ (KHR has no minor unit on the site). */
export function formatMoney(amount, currency = 'USD') {
  const n = num(amount)
  if (n === null) return null
  if (currency === 'KHR') return `${Math.round(n).toLocaleString('en-US')} ៛`
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: n % 1 ? 2 : 0,
      maximumFractionDigits: n % 1 ? 2 : 0,
    }).format(n)
  } catch {
    return `${currency || ''} ${n}`.trim()
  }
}

/** Local YYYY-MM-DD for "today" (dates from the API are plain dates, no timezone). */
export const todayISO = (now = new Date()) => {
  const p = (x) => String(x).padStart(2, '0')
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`
}

export const fmtShortDate = (iso) =>
  iso ? new Date(`${String(iso).slice(0, 10)}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null

/** Confirmed (status = enrolled) students: seats − seats_left; falls back to enrolled_count. */
export function confirmedCount(c) {
  const seats = num(c?.seats)
  const left = num(c?.seats_left)
  if (seats !== null && left !== null) return Math.max(0, seats - left)
  return num(c?.enrolled_count)
}

/**
 * Early-bird state, or null when no valid early-bird price is configured.
 * Prefers the engine's computed `early_bird_active` / `early_bird_seats_left` when present.
 */
export function earlyBirdState(c, now = new Date()) {
  const price = num(c?.price)
  const eb = num(c?.early_bird_price)
  if (eb === null || price === null || !(eb < price) || eb < 0) return null
  const until = c.early_bird_until ? String(c.early_bird_until).slice(0, 10) : null
  const limit = num(c.early_bird_seats)
  let seatsLeft = num(c.early_bird_seats_left)
  if (seatsLeft === null && limit !== null) {
    const taken = confirmedCount(c)
    seatsLeft = taken === null ? limit : Math.max(0, limit - taken)
  }
  const dateOk = !until || todayISO(now) <= until
  const seatsOk = limit === null || seatsLeft > 0
  const active = typeof c.early_bird_active === 'boolean' ? c.early_bird_active : dateOk && seatsOk
  return {
    price: eb,
    regular: price,
    saving: price - eb,
    until,
    limit,
    seatsLeft: limit !== null ? seatsLeft : null,
    active,
  }
}

/**
 * Normalised payment options for one class. Only options that are configured (and, for the
 * early bird, still running) are returned; everything else is null.
 */
export function paymentOptions(c, now = new Date()) {
  const currency = c?.currency || 'USD'
  const price = num(c?.price)
  const count = num(c?.installment_count)
  const amount = num(c?.installment_amount)
  const installments = count !== null && count >= 2 && amount !== null && amount > 0
    ? { count: Math.round(count), amount, total: Math.round(count) * amount }
    : null
  const depositAmt = num(c?.deposit_amount)
  const deposit = depositAmt !== null && depositAmt > 0 ? depositAmt : null
  const eb = c ? earlyBirdState(c, now) : null
  const earlyBird = eb?.active ? eb : null
  const ref = num(c?.referral_discount)
  const referral = ref !== null && ref > 0 ? ref : null
  const engineEffective = num(c?.effective_price)
  const effectivePrice = engineEffective !== null ? engineEffective : earlyBird ? earlyBird.price : price
  return {
    currency,
    price,
    effectivePrice,
    installments,
    deposit,
    earlyBird,
    referral,
    any: Boolean(installments || deposit || earlyBird || referral),
  }
}

/** Short labels for whichever options are configured (admin class cards, public class rows). */
export function paymentPills(c, now = new Date()) {
  const o = paymentOptions(c, now)
  const pills = []
  if (o.installments) pills.push({ key: 'installments', label: `${o.installments.count}× monthly`, icon: 'bi-calendar2-week' })
  if (o.deposit) pills.push({ key: 'deposit', label: 'Deposit', icon: 'bi-bookmark-check' })
  const eb = earlyBirdState(c || {}, now)
  if (eb) pills.push({ key: 'early', label: eb.active ? 'Early bird' : 'Early bird · ended', icon: 'bi-alarm', muted: !eb.active })
  if (o.referral) pills.push({ key: 'referral', label: 'Referral', icon: 'bi-people' })
  return pills
}
