<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  COHORT_ACCEPTS_PAYMENT_OPTIONS, COHORT_STATUSES, FORMAT_LABEL, confirmedSeats, pickPaymentFields, deleteCohort, deleteCourse, fieldErrors, fmtDate, formatPrice, getCourse, slugify, updateCohort, updateCourse,
} from '../../admin/courseApi.js'
import { paymentPills } from '../../data/paymentOptions.js'
import { toast, toastError } from '../../admin/toast.js'
import AdminToasts from '../../components/admin/AdminToasts.vue'
import CourseModulesTab from '../../components/admin/CourseModulesTab.vue'
import CohortDrawer from '../../components/admin/CohortDrawer.vue'
import RosterDrawer from '../../components/admin/RosterDrawer.vue'

const route = useRoute()
const router = useRouter()
const TABS = [
  { id: 'details', label: 'Details', icon: 'bi-card-text' },
  { id: 'modules', label: 'Modules', icon: 'bi-list-ol' },
  { id: 'classes', label: 'Classes', icon: 'bi-calendar3' },
]
const tab = ref(TABS.some((t) => t.id === route.query.tab) ? route.query.tab : 'details')
watch(tab, (t) => router.replace({ query: { ...route.query, tab: t } }))

const course = ref(null)
const loading = ref(true)
const loadError = ref('')
const form = reactive({ title: '', slug: '', summary: '', hours: '', level: '', min_students: '', is_published: false, languages: [] })
const langInput = ref('')
const errors = ref({})
const saving = ref(false)
const LANG_SUGGEST = ['English', 'Khmer']

function fill(c) {
  Object.assign(form, {
    title: c.title || '', slug: c.slug || '', summary: c.summary || '', hours: c.hours ?? '', level: c.level || '',
    min_students: c.min_students ?? '', is_published: !!c.is_published, languages: [...(c.languages || [])],
  })
}
async function load(refill = true) {
  try {
    const c = await getCourse(route.params.id)
    course.value = c
    if (refill) fill(c)
  } catch (e) { if (e.status !== 401) loadError.value = e.status === 404 ? 'Course not found.' : e.message } finally { loading.value = false }
}
load()

function addLang(v = langInput.value) {
  const s = v.trim().replace(/,$/, '')
  if (s && !form.languages.some((l) => l.toLowerCase() === s.toLowerCase())) form.languages.push(s)
  langInput.value = ''
}
const onLangKey = (e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addLang() } else if (e.key === 'Backspace' && !langInput.value) form.languages.pop() }

function validate() {
  const e = {}
  if (!form.title.trim()) e.title = 'Title is required.'
  if (!form.slug) e.slug = 'Slug is required.'
  else if (!/^[a-z0-9_-]+$/i.test(form.slug)) e.slug = 'Use letters, numbers, dashes or underscores only.'
  if (form.hours !== '' && !(Number(form.hours) >= 0 && Number(form.hours) <= 1000)) e.hours = 'Between 0 and 1000.'
  if (form.min_students !== '' && !(Number(form.min_students) >= 1 && Number(form.min_students) <= 500)) e.min_students = 'Between 1 and 500, or leave empty.'
  errors.value = e
  return !Object.keys(e).length
}
async function save() {
  if (langInput.value) addLang()
  if (!validate()) return toast('Please fix the highlighted fields.', 'error')
  saving.value = true
  try {
    const c = await updateCourse(course.value.id, {
      title: form.title.trim(), slug: form.slug, summary: form.summary || null,
      hours: form.hours === '' ? null : Number(form.hours), level: form.level || null,
      min_students: form.min_students === '' ? null : Number(form.min_students),
      is_published: form.is_published, languages: form.languages,
    })
    course.value = c
    fill(c)
    toast('Course saved.')
  } catch (e) { errors.value = fieldErrors(e); toastError(e) } finally { saving.value = false }
}
async function removeCourse() {
  const n = course.value.cohorts?.length || 0
  if (!window.confirm(`Delete “${course.value.title}”${n ? ` and its ${n} class(es)` : ''}? This can’t be undone.`)) return
  try { await deleteCourse(course.value.id); toast('Course deleted.'); router.push({ name: 'admin-courses' }) } catch (e) { toastError(e) }
}

// ---- Classes
const cohorts = computed(() => course.value?.cohorts || [])
const drawer = ref(null) // { mode, cohort }
const roster = ref(null)
const minFor = (c) => c.min_students || course.value?.min_students || 0
const progressPct = (c) => (minFor(c) ? Math.min(100, Math.round(((c.enrolled_count || 0) / minFor(c)) * 100)) : 0)
const QUICK = { open: ['Open', 'bi-door-open'], full: ['Mark full', 'bi-people-fill'], closed: ['Close', 'bi-lock'], draft: ['Back to draft', 'bi-pencil-square'] }

function cohortBody(c, patch) {
  return { title: c.title, start_date: c.start_date, end_date: c.end_date, schedule_text: c.schedule_text, format: c.format, seats: c.seats,
    // Resource returns the course default when unset; only keep a real override.
    min_students: c.min_students && c.min_students !== course.value.min_students ? c.min_students : null,
    price: c.price === null || c.price === undefined ? null : Number(c.price), currency: c.currency, status: c.status,
    // Echo back whichever payment fields the engine returned so a status change never clears them.
    ...(COHORT_ACCEPTS_PAYMENT_OPTIONS ? pickPaymentFields(c) : {}), ...patch }
}
async function setCohortStatus(c, status) {
  try {
    // StoreCohortRequest is reused for PATCH (title/format/seats/status required) → send the full object.
    const saved = await updateCohort(course.value.id, c.id, cohortBody(c, { status }))
    Object.assign(c, saved)
    toast(`“${c.title}” is now ${status}.`)
  } catch (e) { toastError(e) }
}
async function removeCohort(c) {
  if (!window.confirm(`Delete class “${c.title}”? Linked requests keep existing but lose their class.`)) return
  try { await deleteCohort(course.value.id, c.id); toast('Class deleted.'); load(false) } catch (e) { toastError(e) }
}
function onCohortSaved() { drawer.value = null; load(false) }
</script>

<template>
  <div class="ed">
    <AdminToasts />
    <RouterLink class="back" :to="{ name: 'admin-courses' }"><i class="bi bi-arrow-left"></i> All courses</RouterLink>
    <div v-if="loading" class="muted pad">Loading course…</div>
    <div v-else-if="loadError" class="adm-alert error">{{ loadError }}</div>
    <template v-else-if="course">
      <header class="head tile">
        <div class="ht">
          <span class="pill-st" :class="course.is_published ? 'published' : 'draft'">{{ course.is_published ? 'Published' : 'Draft' }}</span>
          <h1>{{ course.title }}</h1>
          <p class="muted">/courses/{{ course.slug }} · {{ course.hours ?? 0 }}h · {{ cohorts.length }} classes · {{ course.enquiries_count ?? 0 }} requests</p>
        </div>
        <nav class="tabs" role="tablist">
          <button v-for="t in TABS" :key="t.id" role="tab" type="button" :aria-selected="tab === t.id" :class="{ on: tab === t.id }" @click="tab = t.id">
            <i class="bi" :class="t.icon"></i> {{ t.label }}
            <span v-if="t.id === 'modules'" class="cnt">{{ course.modules?.length || 0 }}</span>
            <span v-if="t.id === 'classes'" class="cnt">{{ cohorts.length }}</span>
          </button>
        </nav>
      </header>

      <!-- DETAILS -->
      <form v-if="tab === 'details'" class="tile pane details" novalidate @submit.prevent="save">
        <div class="publish">
          <div><strong>Published</strong><p class="muted">Visible on the public courses page.</p></div>
          <button type="button" class="switch" role="switch" :aria-checked="form.is_published" :class="{ on: form.is_published }" @click="form.is_published = !form.is_published"><span></span></button>
        </div>
        <div class="g">
          <div class="adm-field full" :class="{ invalid: errors.title }"><label class="adm-label" for="c-title">Title</label><input id="c-title" v-model="form.title" class="adm-input" maxlength="160" /><small v-if="errors.title" class="adm-err">{{ errors.title }}</small></div>
          <div class="adm-field full" :class="{ invalid: errors.slug }"><label class="adm-label" for="c-slug">Slug</label>
            <div class="slugrow"><input id="c-slug" v-model="form.slug" class="adm-input" maxlength="180" /><button class="adm-btn pill sm" type="button" @click="form.slug = slugify(form.title)">From title</button></div>
            <small v-if="errors.slug" class="adm-err">{{ errors.slug }}</small><small v-else class="adm-help">Changing it breaks old /courses/{{ course.slug }} links.</small></div>
          <div class="adm-field full" :class="{ invalid: errors.summary }"><label class="adm-label" for="c-sum">Summary</label><textarea id="c-sum" v-model="form.summary" class="adm-textarea" rows="4" maxlength="5000"></textarea><small v-if="errors.summary" class="adm-err">{{ errors.summary }}</small></div>
          <div class="adm-field" :class="{ invalid: errors.hours }"><label class="adm-label" for="c-hours">Hours</label><input id="c-hours" v-model="form.hours" type="number" min="0" max="1000" class="adm-input" /><small v-if="errors.hours" class="adm-err">{{ errors.hours }}</small></div>
          <div class="adm-field" :class="{ invalid: errors.min_students }"><label class="adm-label" for="c-min">Min students to open a class</label><input id="c-min" v-model="form.min_students" type="number" min="1" max="500" class="adm-input" placeholder="4" /><small v-if="errors.min_students" class="adm-err">{{ errors.min_students }}</small><small v-else class="adm-help">Default for every class; a class can override it.</small></div>
          <div class="adm-field" :class="{ invalid: errors.level }"><label class="adm-label" for="c-level">Level</label><input id="c-level" v-model="form.level" class="adm-input" maxlength="100" placeholder="Beginner to intermediate" /><small v-if="errors.level" class="adm-err">{{ errors.level }}</small></div>
          <div class="adm-field" :class="{ invalid: errors.languages }"><label class="adm-label" for="c-lang">Languages</label>
            <div class="chips adm-input" @click="$refs.lang.focus()">
              <span v-for="(l, i) in form.languages" :key="l" class="chip">{{ l }}<button type="button" :aria-label="`Remove ${l}`" @click.stop="form.languages.splice(i, 1)">×</button></span>
              <input id="c-lang" ref="lang" v-model="langInput" placeholder="Add…" @keydown="onLangKey" @blur="langInput && addLang()" />
            </div>
            <div class="sugg"><button v-for="s in LANG_SUGGEST.filter((x) => !form.languages.includes(x))" :key="s" type="button" class="chip ghost" @click="addLang(s)">+ {{ s }}</button></div>
            <small v-if="errors.languages" class="adm-err">{{ errors.languages }}</small></div>
        </div>
        <div class="actions">
          <button class="adm-btn danger pill" type="button" @click="removeCourse"><i class="bi bi-trash"></i> Delete course</button>
          <button class="adm-btn primary pill" :disabled="saving">{{ saving ? 'Saving…' : 'Save changes' }}</button>
        </div>
      </form>

      <CourseModulesTab v-else-if="tab === 'modules'" :course="course" @changed="load(false)" />

      <!-- CLASSES -->
      <section v-else class="pane">
        <div class="ctool">
          <p class="muted">A class opens once it reaches its minimum ({{ course.min_students || 4 }} by default). Progress counts new + contacted + enrolled requests.</p>
          <button class="adm-btn primary pill" type="button" @click="drawer = { mode: 'new' }"><i class="bi bi-plus-lg"></i> New class</button>
        </div>
        <p v-if="!cohorts.length" class="tile muted pad center">No classes yet. Create the first intake.</p>
        <div class="cgrid">
          <article v-for="c in cohorts" :key="c.id" class="tile cohort">
            <div class="ctop"><span class="pill-st" :class="c.status">{{ c.status }}</span><span class="fmt">{{ FORMAT_LABEL[c.format] || c.format }}</span></div>
            <h3>{{ c.title }}</h3>
            <ul class="facts">
              <li><i class="bi bi-calendar-event"></i> {{ fmtDate(c.start_date) }} → {{ fmtDate(c.end_date) }}</li>
              <li><i class="bi bi-clock"></i> {{ c.schedule_text || 'Schedule TBA' }}</li>
              <li><i class="bi bi-tag"></i> {{ formatPrice(c) }}</li>
            </ul>
            <ul v-if="paymentPills(c).length" class="paypills" aria-label="Payment options">
              <li v-for="p in paymentPills(c)" :key="p.key" :class="{ muted: p.muted }"><i class="bi" :class="p.icon" aria-hidden="true"></i> {{ p.label }}</li>
            </ul>
            <div class="prog">
              <div class="pl"><span><strong>{{ c.enrolled_count || 0 }}</strong> / {{ minFor(c) || '—' }} min</span><span>{{ c.seats_left }} of {{ c.seats }} seats left</span></div>
              <div class="progress" :class="{ ok: progressPct(c) >= 100 }"><span :style="{ width: progressPct(c) + '%' }"></span></div>
              <small class="muted">{{ confirmedSeats(c) }} confirmed enrolled</small>
            </div>
            <div class="quick">
              <button v-for="s in COHORT_STATUSES.filter((x) => x !== c.status)" :key="s" class="adm-btn sm pill" type="button" @click="setCohortStatus(c, s)"><i class="bi" :class="QUICK[s][1]"></i> {{ QUICK[s][0] }}</button>
            </div>
            <div class="cacts">
              <button class="adm-btn sm pill primary" type="button" @click="roster = c"><i class="bi bi-people"></i> Roster</button>
              <button class="adm-btn sm pill" type="button" @click="drawer = { mode: 'edit', cohort: c }"><i class="bi bi-pencil"></i> Edit</button>
              <button class="adm-btn sm pill" type="button" @click="drawer = { mode: 'duplicate', cohort: c }"><i class="bi bi-copy"></i> Duplicate</button>
              <button class="adm-btn sm icon danger" type="button" aria-label="Delete class" @click="removeCohort(c)"><i class="bi bi-trash"></i></button>
            </div>
          </article>
        </div>
      </section>

      <CohortDrawer v-if="drawer" :key="drawer.mode + (drawer.cohort?.id || '')" :course="course" :cohort="drawer.cohort" :mode="drawer.mode" @close="drawer = null" @saved="onCohortSaved" />
      <RosterDrawer v-if="roster" :course="course" :cohort="roster" @close="roster = null" @changed="load(false)" />
    </template>
  </div>
</template>

<style scoped>
.tile { background: #fff; border: 1px solid var(--border); border-radius: 24px; }
.muted { color: var(--muted); } .pad { padding: 20px; } .center { text-align: center; }
.back { display: inline-flex; gap: 6px; align-items: center; color: var(--muted); text-decoration: none; font-size: .9rem; margin-bottom: 12px; }
.back:hover { color: #4F46E5; }
.head { padding: 22px 22px 0; margin-bottom: 16px; }
.head h1 { margin: 10px 0 4px; font-size: 1.6rem; letter-spacing: -0.02em; } .head p { margin: 0; font-size: .88rem; }
.tabs { display: flex; gap: 4px; margin-top: 16px; overflow-x: auto; }
.tabs button { display: inline-flex; gap: 8px; align-items: center; height: 44px; padding: 0 16px; border: 0; border-bottom: 2px solid transparent; background: none; font: inherit; color: var(--muted); cursor: pointer; white-space: nowrap; }
.tabs button.on { color: #4F46E5; border-bottom-color: #4F46E5; font-weight: 600; }
.cnt { min-width: 22px; height: 20px; padding: 0 6px; border-radius: 999px; background: #eef2ff; color: #4F46E5; font-size: .72rem; display: grid; place-items: center; }
.details { padding: 22px; }
.publish { display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; border-radius: 20px; background: #fafaf9; margin-bottom: 18px; }
.publish p { margin: 2px 0 0; font-size: .85rem; }
.switch { width: 52px; height: 30px; border-radius: 999px; border: 0; background: #d4d4d8; position: relative; cursor: pointer; transition: background .2s; }
.switch span { position: absolute; top: 3px; left: 3px; width: 24px; height: 24px; border-radius: 50%; background: #fff; transition: transform .2s; box-shadow: 0 1px 3px rgb(0 0 0 / 20%); }
.switch.on { background: #4F46E5; } .switch.on span { transform: translateX(22px); }
.g { display: grid; grid-template-columns: 1fr 1fr; gap: 0 14px; } .full { grid-column: 1 / -1; }
.slugrow { display: flex; gap: 8px; align-items: center; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; height: auto; min-height: 42px; padding: 5px 8px; cursor: text; }
.chips input { flex: 1; min-width: 70px; border: 0; outline: 0; font: inherit; background: none; }
.chip { display: inline-flex; align-items: center; gap: 4px; height: 28px; padding: 0 10px; border-radius: 999px; background: #eef2ff; color: #4338ca; font-size: .84rem; border: 1px solid #c7d2fe; }
.chip button { border: 0; background: none; color: inherit; cursor: pointer; font-size: 1rem; line-height: 1; padding: 0; }
.chip.ghost { background: #fff; color: var(--muted); border-color: var(--border); cursor: pointer; font: inherit; font-size: .8rem; }
.sugg { display: flex; gap: 6px; margin-top: 6px; }
.actions { display: flex; justify-content: space-between; gap: 8px; margin-top: 8px; padding-top: 16px; border-top: 1px solid var(--border); }
.ctool { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 14px; } .ctool p { margin: 0; font-size: .9rem; max-width: 62ch; }
.cgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(330px, 1fr)); gap: 14px; }
.cohort { padding: 20px; display: flex; flex-direction: column; gap: 12px; }
.ctop { display: flex; justify-content: space-between; align-items: center; } .fmt { font-size: .8rem; color: var(--muted); padding: 4px 10px; border-radius: 999px; background: #fafaf9; }
.cohort h3 { margin: 0; font-size: 1.1rem; letter-spacing: -0.01em; }
.facts { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; font-size: .88rem; color: #3f3f46; } .facts i { color: #4F46E5; margin-right: 6px; }
.paypills { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px; }
.paypills li { display: inline-flex; align-items: center; gap: 5px; height: 26px; padding: 0 10px; border-radius: 999px; background: #eef2ff; color: #4338ca; border: 1px solid #c7d2fe; font-size: .78rem; font-weight: 600; white-space: nowrap; }
.paypills li.muted { background: #f5f5f4; color: #525252; border-color: #e5e5e5; font-weight: 500; }
.prog { display: grid; gap: 6px; padding: 12px; border-radius: 18px; background: #fafaf9; } .pl { display: flex; justify-content: space-between; font-size: .84rem; color: var(--muted); } .pl strong { color: var(--text); font-size: 1rem; }
.quick, .cacts { display: flex; flex-wrap: wrap; gap: 6px; } .cacts { padding-top: 10px; border-top: 1px solid var(--border); }
@media (max-width: 640px) {
  .g { grid-template-columns: 1fr; } .ctool { flex-direction: column; align-items: stretch; } .cgrid { grid-template-columns: 1fr; }
  .actions { flex-direction: column-reverse; } .head { padding: 18px 16px 0; } .details { padding: 16px; }
}
</style>
