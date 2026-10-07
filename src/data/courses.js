// Static course catalogue used when the engine API is unreachable or doesn't (yet) list a course.
// Only facts Max has already published live here — no invented prices, dates, or curricula.
export const MIN_STUDENTS = 4

export const FULL_STACK_SLUG = 'full-stack-teaching-course'
export const DEVOPS_SLUG = 'devops-course'

export const contact = {
  email: 'roeunvireak0@gmail.com',
  telegramUrl: 'https://t.me/R_Vireak',
  telegramHandle: '@R_Vireak',
}

export const staticCourses = [
  {
    id: null,
    slug: FULL_STACK_SLUG,
    title: 'Full-stack teaching course',
    shortTitle: 'Full-Stack',
    summary: '60-hour Laravel + Vue curriculum with a Class Manager capstone, delivered bilingual in English and Khmer.',
    hours: 60,
    languages: ['English', 'Khmer'],
    level: 'Beginner to intermediate',
    icon: 'bi bi-stack',
    stack: ['Laravel', 'Vue', 'MySQL', 'REST APIs'],
    outcomes: [
      'Build Laravel APIs with routing, Eloquent, validation, and auth',
      'Build a Vue frontend that talks to your Laravel API',
      'Ship a Class Manager capstone end to end',
    ],
    modules: [
      { id: 's1', title: 'Web foundations', hours: 8, description: 'HTML, CSS, JavaScript refreshers and tooling.' },
      { id: 's2', title: 'PHP & Laravel core', hours: 16, description: 'Routing, Eloquent, validation, auth, and APIs.' },
      { id: 's3', title: 'Vue frontend', hours: 16, description: 'Components, routing, forms, and talking to Laravel APIs.' },
      { id: 's4', title: 'Class Manager capstone', hours: 20, description: 'An end-to-end app that ties Laravel and Vue together.' },
    ],
    outlinePending: false,
    cohorts: [],
  },
  {
    id: null,
    slug: DEVOPS_SLUG,
    title: 'DevOps course',
    shortTitle: 'DevOps',
    // TODO(Max): replace with the real summary once the DevOps course is seeded in the engine.
    summary: 'Deploy and run real apps the way I do in production — containers, pipelines, and servers.',
    hours: null,
    languages: ['English', 'Khmer'],
    level: null,
    icon: 'bi bi-hdd-network',
    stack: ['Docker', 'CI/CD', 'Coolify', 'Nixpacks', 'AWS', 'Linux servers'],
    // "What it covers" — topics only from the real stack on the homepage. Outline TBD by Max.
    outcomes: [
      'Containerise apps with Docker',
      'Automate builds and deploys with CI/CD',
      'Deploy with Coolify and Nixpacks on Linux servers and AWS',
    ],
    modules: [],
    outlinePending: true,
    cohorts: [],
  },
]

export const staticBySlug = Object.fromEntries(staticCourses.map((c) => [c.slug, c]))

/** Merge an API course (CourseResource) over the static fallback for the same slug. */
export function mergeCourse(api, fallback = staticBySlug[api?.slug]) {
  const base = fallback || {
    shortTitle: api?.title,
    icon: 'bi bi-journal-code',
    stack: [],
    outcomes: [],
    modules: [],
    outlinePending: true,
    cohorts: [],
  }
  if (!api) return { ...base, fromApi: false }
  const modules = Array.isArray(api.modules) && api.modules.length ? api.modules : base.modules
  return {
    ...base,
    id: api.id ?? null,
    slug: api.slug || base.slug,
    title: api.title || base.title,
    summary: api.summary || base.summary,
    hours: api.hours ?? base.hours,
    languages: api.languages?.length ? api.languages : base.languages,
    level: api.level || base.level,
    minStudents: Number(api.min_students) || null,
    modules,
    outlinePending: !modules.length,
    cohorts: Array.isArray(api.cohorts) ? api.cohorts : [],
    fromApi: true,
  }
}

export const minStudentsFor = (course, cohort) =>
  Number(cohort?.min_students) || Number(course?.minStudents) || MIN_STUDENTS

const money = (price, currency) => {
  const n = Number(price)
  if (!Number.isFinite(n)) return null
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD', maximumFractionDigits: n % 1 ? 2 : 0 }).format(n)
  } catch {
    return `${currency || ''} ${n}`.trim()
  }
}

export const cohortPrice = (c) => (c?.price != null && c.price !== '' ? money(c.price, c.currency) : null)

/** Lowest cohort price, or null → "Price on request". */
export function coursePrice(course) {
  const priced = (course?.cohorts || []).filter((c) => cohortPrice(c))
  if (!priced.length) return null
  const min = priced.reduce((a, b) => (Number(b.price) < Number(a.price) ? b : a))
  return { label: money(min.price, min.currency), from: priced.length > 1 }
}

export const visibleCohorts = (course) =>
  (course?.cohorts || []).filter((c) => ['open', 'full', 'closed'].includes(c.status))

/** Seat/opening progress for a cohort. hasCounts=false when the API sends no enrolled_count. */
export function cohortProgress(course, cohort) {
  const min = minStudentsFor(course, cohort)
  const seats = Number(cohort?.seats) || null
  const hasCounts = cohort?.enrolled_count != null
  const enrolled = hasCounts ? Number(cohort.enrolled_count) : null
  const seatsLeft = cohort?.seats_left != null ? Number(cohort.seats_left) : seats != null && hasCounts ? Math.max(0, seats - enrolled) : null
  const confirmed = hasCounts && enrolled >= min
  let label
  let pct = 0
  if (!hasCounts) label = seats ? `${seats} seats` : 'Seats to be confirmed'
  else if (!confirmed) {
    label = `${enrolled} of ${min} needed to open`
    pct = Math.min(100, Math.round((enrolled / min) * 100))
  } else {
    label = seatsLeft != null ? `Class confirmed · ${seatsLeft} seat${seatsLeft === 1 ? '' : 's'} left` : 'Class confirmed'
    pct = seats ? Math.min(100, Math.round((enrolled / seats) * 100)) : 100
  }
  return { min, seats, enrolled, seatsLeft, hasCounts, confirmed, label, pct, needed: hasCounts ? Math.max(0, min - enrolled) : null }
}

export function nextClassStatus(course) {
  const open = visibleCohorts(course).filter((c) => c.status === 'open')
  if (!open.length) {
    if (visibleCohorts(course).some((c) => c.status === 'full')) return { tone: 'muted', text: 'Current class is full — join the next one' }
    return { tone: 'muted', text: 'Next class forming — request a seat' }
  }
  const p = cohortProgress(course, open[0])
  if (!p.hasCounts) return { tone: 'live', text: `Enrolling · ${formatCohortDates(open[0])}` }
  return p.confirmed
    ? { tone: 'live', text: p.seatsLeft != null ? `Class confirmed · ${p.seatsLeft} seats left` : 'Class confirmed' }
    : { tone: 'accent', text: `${p.enrolled} of ${p.min} students to open` }
}

export function formatCohortDates(c) {
  const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null)
  const start = fmt(c?.start_date)
  const end = fmt(c?.end_date)
  if (start && end) return `${start} – ${end}`
  return start || end || 'Dates to be confirmed'
}

export const formatLabel = (v) => {
  const s = String(v || '').replaceAll('_', ' ')
  return s ? s[0].toUpperCase() + s.slice(1) : ''
}

/** Load the catalogue: API list merged with static fallbacks so both known courses always show. */
export async function loadCourses(engineAPI, enabled) {
  let apiList = []
  if (enabled) {
    try {
      const { data } = await engineAPI.get('/courses')
      apiList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
    } catch {
      apiList = []
    }
  }
  const bySlug = Object.fromEntries(apiList.map((c) => [c.slug, c]))
  const known = staticCourses.map((s) => mergeCourse(bySlug[s.slug], s))
  const extra = apiList.filter((c) => !staticBySlug[c.slug]).map((c) => mergeCourse(c, null))
  return [...known, ...extra]
}
