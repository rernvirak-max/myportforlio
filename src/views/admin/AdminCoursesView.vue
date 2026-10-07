<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api, apiConfigured } from '../../admin/api.js'

const router = useRouter()
const STATUSES = ['new', 'contacted', 'enrolled', 'declined']
const COHORT_STATUSES = ['draft', 'open', 'full', 'closed']
const COHORT_FORMATS = ['online', 'in_person', 'hybrid']

const loading = ref(false)
const error = ref('')
const flash = ref('')
const courses = ref([])
const selected = ref(null)
const detailLoading = ref(false)

const enrollOpen = ref(false)
const enrollLoading = ref(false)
const enrollRows = ref([])
const enrollCohortId = ref('')
const enrollStatus = ref('')

const showCreate = ref(false)
const creating = ref(false)
const createForm = reactive({
  title: '',
  summary: '',
  hours: 60,
  languages: 'English, Khmer',
  level: 'Beginner to intermediate',
  is_published: true,
})

const moduleForm = reactive({ title: '', hours: 4, description: '' })
const cohortForm = reactive({
  title: '',
  start_date: '',
  end_date: '',
  schedule_text: '',
  format: 'online',
  seats: 12,
  price: '',
  currency: 'USD',
  status: 'open',
})
const savingMeta = ref(false)

const openCohorts = computed(() => selected.value?.cohorts?.filter((c) => c.status === 'open') || [])

async function loadList() {
  if (!apiConfigured) return
  loading.value = true
  error.value = ''
  try {
    const data = await api('/admin/courses')
    courses.value = data.data || []
  } catch (e) {
    if (e.status !== 401) error.value = e.message
  } finally {
    loading.value = false
  }
}

async function openCourse(course) {
  detailLoading.value = true
  error.value = ''
  try {
    const data = await api(`/admin/courses/${course.id}`)
    selected.value = data.data
  } catch (e) {
    if (e.status !== 401) error.value = e.message
  } finally {
    detailLoading.value = false
  }
}

function backToList() {
  selected.value = null
  loadList()
}

async function createCourse() {
  creating.value = true
  error.value = ''
  try {
    const languages = createForm.languages
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const { data } = await api('/admin/courses', {
      method: 'POST',
      body: {
        title: createForm.title,
        summary: createForm.summary || null,
        hours: Number(createForm.hours) || 0,
        languages,
        level: createForm.level || null,
        is_published: createForm.is_published,
      },
    })
    showCreate.value = false
    createForm.title = ''
    createForm.summary = ''
    flash.value = `Created ${data.title}.`
    await openCourse(data)
  } catch (e) {
    if (e.status !== 401) error.value = e.message
  } finally {
    creating.value = false
  }
}

async function togglePublish() {
  if (!selected.value) return
  savingMeta.value = true
  try {
    const { data } = await api(`/admin/courses/${selected.value.id}`, {
      method: 'PATCH',
      body: { is_published: !selected.value.is_published },
    })
    selected.value = data
    flash.value = data.is_published ? 'Course published.' : 'Course unpublished.'
  } catch (e) {
    if (e.status !== 401) error.value = e.message
  } finally {
    savingMeta.value = false
  }
}

async function addModule() {
  if (!selected.value || !moduleForm.title.trim()) return
  try {
    await api(`/admin/courses/${selected.value.id}/modules`, {
      method: 'POST',
      body: {
        title: moduleForm.title.trim(),
        hours: Number(moduleForm.hours) || 0,
        description: moduleForm.description || null,
      },
    })
    moduleForm.title = ''
    moduleForm.description = ''
    moduleForm.hours = 4
    await openCourse(selected.value)
    flash.value = 'Module added.'
  } catch (e) {
    if (e.status !== 401) error.value = e.message
  }
}

async function removeModule(mod) {
  if (!window.confirm(`Remove module “${mod.title}”?`)) return
  try {
    await api(`/admin/courses/${selected.value.id}/modules/${mod.id}`, { method: 'DELETE' })
    await openCourse(selected.value)
  } catch (e) {
    if (e.status !== 401) error.value = e.message
  }
}

async function addCohort() {
  if (!selected.value || !cohortForm.title.trim()) return
  try {
    await api(`/admin/courses/${selected.value.id}/cohorts`, {
      method: 'POST',
      body: {
        title: cohortForm.title.trim(),
        start_date: cohortForm.start_date || null,
        end_date: cohortForm.end_date || null,
        schedule_text: cohortForm.schedule_text || null,
        format: cohortForm.format,
        seats: Number(cohortForm.seats) || 1,
        price: cohortForm.price === '' ? null : Number(cohortForm.price),
        currency: cohortForm.currency || 'USD',
        status: cohortForm.status,
      },
    })
    cohortForm.title = ''
    cohortForm.schedule_text = ''
    cohortForm.start_date = ''
    cohortForm.end_date = ''
    await openCourse(selected.value)
    flash.value = 'Class / cohort added.'
  } catch (e) {
    if (e.status !== 401) error.value = e.message
  }
}

async function openEnrollments(cohortId = '') {
  enrollCohortId.value = cohortId ? String(cohortId) : ''
  enrollStatus.value = ''
  enrollOpen.value = true
  await loadEnrollments()
}

async function loadEnrollments() {
  if (!selected.value) return
  enrollLoading.value = true
  try {
    const p = new URLSearchParams()
    p.set('course_id', selected.value.id)
    if (enrollCohortId.value) p.set('cohort_id', enrollCohortId.value)
    if (enrollStatus.value) p.set('status', enrollStatus.value)
    p.set('page', '1')
    const data = await api(`/admin/course-enquiries?${p}`)
    enrollRows.value = data.data || []
  } catch (e) {
    if (e.status !== 401) error.value = e.message
  } finally {
    enrollLoading.value = false
  }
}

async function setEnquiryStatus(row, status) {
  try {
    const { data } = await api(`/admin/course-enquiries/${row.id}`, {
      method: 'PATCH',
      body: { status },
    })
    const i = enrollRows.value.findIndex((r) => r.id === data.id)
    if (i !== -1) enrollRows.value[i] = data
    flash.value = `${data.name} → ${status}`
    await openCourse(selected.value)
  } catch (e) {
    if (e.status !== 401) error.value = e.message
  }
}

function goEnquiry(row) {
  router.push({ name: 'admin-enrollments', query: { open: String(row.id), status: '' } })
}

const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'

onMounted(loadList)
</script>

<template>
  <div class="courses">
    <div v-if="error" class="adm-alert error" role="alert">{{ error }}</div>
    <div v-if="flash" class="adm-alert ok" role="status">{{ flash }}</div>

    <!-- LIST -->
    <template v-if="!selected">
      <div class="toolbar">
        <p class="hint">Published courses appear on the public site. Open a course for modules, classes, and enrollments.</p>
        <button class="adm-btn primary" type="button" @click="showCreate = true">New course</button>
      </div>

      <div v-if="loading" class="empty">Loading courses…</div>
      <div v-else-if="!courses.length" class="empty adm-card">
        No courses yet. Create one, or run <code>php artisan db:seed --class=CourseSeeder</code> on the engine.
      </div>

      <div v-else class="grid">
        <button
          v-for="c in courses"
          :key="c.id"
          type="button"
          class="adm-card course-card"
          @click="openCourse(c)"
        >
          <div class="card-top">
            <span class="badge" :class="c.is_published ? 'enrolled' : 'declined'">
              {{ c.is_published ? 'Published' : 'Draft' }}
            </span>
            <span class="meta">{{ c.hours || 0 }}h · {{ c.enquiries_count ?? 0 }} requests</span>
          </div>
          <h2>{{ c.title }}</h2>
          <p>{{ c.summary || 'No summary yet.' }}</p>
          <div class="card-foot">
            <span>{{ (c.languages || []).join(' · ') || '—' }}</span>
            <span>{{ (c.cohorts || []).filter((x) => x.status === 'open').length }} open classes</span>
          </div>
        </button>
      </div>
    </template>

    <!-- DETAIL -->
    <template v-else>
      <div class="detail-top">
        <button class="adm-btn sm" type="button" @click="backToList">← All courses</button>
        <div class="detail-actions">
          <button class="adm-btn" type="button" :disabled="savingMeta" @click="togglePublish">
            {{ selected.is_published ? 'Unpublish' : 'Publish' }}
          </button>
          <button class="adm-btn primary" type="button" @click="openEnrollments()">
            Enrollments ({{ selected.enquiries_count ?? 0 }})
          </button>
        </div>
      </div>

      <div v-if="detailLoading" class="empty">Loading…</div>
      <template v-else>
        <header class="adm-card detail-hero">
          <span class="badge" :class="selected.is_published ? 'enrolled' : 'declined'">
            {{ selected.is_published ? 'Published' : 'Draft' }}
          </span>
          <h2>{{ selected.title }}</h2>
          <p class="summary">{{ selected.summary }}</p>
          <ul class="chips">
            <li>{{ selected.hours || 0 }} hours</li>
            <li v-if="selected.level">{{ selected.level }}</li>
            <li v-for="lang in selected.languages || []" :key="lang">{{ lang }}</li>
            <li>{{ selected.enquiries_count ?? 0 }} enrollment requests</li>
          </ul>
        </header>

        <section class="adm-card block">
          <header class="block-head">
            <h3>Modules / outline</h3>
          </header>
          <ul v-if="selected.modules?.length" class="modules">
            <li v-for="m in selected.modules" :key="m.id">
              <div>
                <strong>{{ m.order }}. {{ m.title }}</strong>
                <p>{{ m.description || '—' }}</p>
              </div>
              <div class="mod-side">
                <span>{{ m.hours }}h</span>
                <button class="adm-btn sm danger" type="button" @click="removeModule(m)">Remove</button>
              </div>
            </li>
          </ul>
          <p v-else class="empty-inline">No modules yet.</p>
          <div class="inline-form">
            <input v-model="moduleForm.title" class="adm-input" placeholder="Module title" />
            <input v-model.number="moduleForm.hours" class="adm-input narrow" type="number" min="0" placeholder="Hours" />
            <input v-model="moduleForm.description" class="adm-input" placeholder="Short description" />
            <button class="adm-btn" type="button" @click="addModule">Add module</button>
          </div>
        </section>

        <section class="adm-card block">
          <header class="block-head">
            <h3>Classes / cohorts</h3>
            <span class="muted">{{ openCohorts.length }} open</span>
          </header>
          <div v-if="selected.cohorts?.length" class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Dates</th>
                  <th>Format</th>
                  <th>Seats</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="c in selected.cohorts" :key="c.id">
                  <td>
                    <strong>{{ c.title }}</strong>
                    <div class="sub">{{ c.schedule_text || '—' }}</div>
                  </td>
                  <td>{{ fmtDate(c.start_date) }} – {{ fmtDate(c.end_date) }}</td>
                  <td class="cap">{{ c.format.replace('_', ' ') }}</td>
                  <td>{{ c.enrolled_count }}/{{ c.seats }} <span class="muted">({{ c.seats_left }} left)</span></td>
                  <td><span class="badge" :class="c.status === 'open' ? 'enrolled' : 'declined'">{{ c.status }}</span></td>
                  <td>
                    <button class="adm-btn sm" type="button" @click="openEnrollments(c.id)">Enrollments</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="empty-inline">No classes yet.</p>

          <div class="cohort-form">
            <input v-model="cohortForm.title" class="adm-input" placeholder="Class title" />
            <input v-model="cohortForm.start_date" class="adm-input" type="date" />
            <input v-model="cohortForm.end_date" class="adm-input" type="date" />
            <input v-model="cohortForm.schedule_text" class="adm-input" placeholder="Schedule text" />
            <select v-model="cohortForm.format" class="adm-select">
              <option v-for="f in COHORT_FORMATS" :key="f" :value="f">{{ f.replace('_', ' ') }}</option>
            </select>
            <input v-model.number="cohortForm.seats" class="adm-input narrow" type="number" min="1" placeholder="Seats" />
            <select v-model="cohortForm.status" class="adm-select">
              <option v-for="s in COHORT_STATUSES" :key="s" :value="s">{{ s }}</option>
            </select>
            <button class="adm-btn" type="button" @click="addCohort">Add class</button>
          </div>
        </section>
      </template>
    </template>

    <!-- CREATE DIALOG -->
    <Teleport to="body">
      <div v-if="showCreate" class="scrim" @click.self="showCreate = false">
        <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="create-course-title">
          <header>
            <h2 id="create-course-title">New course</h2>
            <button class="adm-btn sm" type="button" @click="showCreate = false">✕</button>
          </header>
          <label class="adm-label">Title</label>
          <input v-model="createForm.title" class="adm-input" />
          <label class="adm-label" style="margin-top: 12px">Summary</label>
          <textarea v-model="createForm.summary" class="adm-textarea" rows="3" />
          <div class="dialog-grid">
            <div>
              <label class="adm-label">Hours</label>
              <input v-model.number="createForm.hours" class="adm-input" type="number" min="0" />
            </div>
            <div>
              <label class="adm-label">Level</label>
              <input v-model="createForm.level" class="adm-input" />
            </div>
          </div>
          <label class="adm-label" style="margin-top: 12px">Languages (comma-separated)</label>
          <input v-model="createForm.languages" class="adm-input" />
          <label class="check">
            <input v-model="createForm.is_published" type="checkbox" />
            Publish immediately
          </label>
          <div class="dialog-actions">
            <button class="adm-btn" type="button" @click="showCreate = false">Cancel</button>
            <button class="adm-btn primary" type="button" :disabled="creating || !createForm.title.trim()" @click="createCourse">
              {{ creating ? 'Creating…' : 'Create course' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ENROLLMENT DIALOG -->
    <Teleport to="body">
      <div v-if="enrollOpen" class="scrim" @click.self="enrollOpen = false">
        <div class="dialog wide" role="dialog" aria-modal="true" aria-labelledby="enroll-title">
          <header>
            <div>
              <h2 id="enroll-title">Enrollment requests</h2>
              <p class="muted">{{ selected?.title }}</p>
            </div>
            <button class="adm-btn sm" type="button" @click="enrollOpen = false">✕</button>
          </header>

          <div class="enroll-filters">
            <select v-model="enrollCohortId" class="adm-select" @change="loadEnrollments">
              <option value="">All classes</option>
              <option v-for="c in selected?.cohorts || []" :key="c.id" :value="String(c.id)">{{ c.title }}</option>
            </select>
            <select v-model="enrollStatus" class="adm-select" @change="loadEnrollments">
              <option value="">All statuses</option>
              <option v-for="s in STATUSES" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>

          <div v-if="enrollLoading" class="empty">Loading…</div>
          <div v-else-if="!enrollRows.length" class="empty">No enrollment requests for this filter.</div>
          <ul v-else class="enroll-list">
            <li v-for="row in enrollRows" :key="row.id">
              <button type="button" class="enroll-row" @click="goEnquiry(row)">
                <div>
                  <strong>{{ row.name }}</strong>
                  <span>{{ row.email }}</span>
                </div>
                <span class="badge" :class="row.status">{{ row.status }}</span>
              </button>
              <select
                class="adm-select status-inline"
                :value="row.status"
                @change="setEnquiryStatus(row, $event.target.value)"
              >
                <option v-for="s in STATUSES" :key="s" :value="s">{{ s }}</option>
              </select>
            </li>
          </ul>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.toolbar { display: flex; justify-content: space-between; gap: 12px; align-items: center; margin-bottom: 16px; }
.hint { margin: 0; color: var(--muted); font-size: .9rem; max-width: 48ch; }
.empty { padding: 40px 16px; text-align: center; color: var(--muted); }
.empty code { font-size: .85em; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
.course-card {
  display: flex; flex-direction: column; gap: 8px; padding: 18px; text-align: left;
  font: inherit; color: inherit; cursor: pointer;
}
.course-card:hover { border-color: var(--accent-line); box-shadow: 0 0 0 3px var(--accent-soft); }
.card-top, .card-foot { display: flex; justify-content: space-between; gap: 8px; align-items: center; }
.card-foot, .meta, .muted, .sub { color: var(--muted); font-size: .82rem; }
.course-card h2 { margin: 0; font-size: 1.15rem; letter-spacing: -0.02em; }
.course-card p { margin: 0; color: var(--muted); font-size: .9rem; line-height: 1.45; flex: 1; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.detail-top { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 14px; flex-wrap: wrap; }
.detail-actions { display: flex; gap: 8px; }
.detail-hero { padding: 22px 22px 18px; margin-bottom: 14px; }
.detail-hero h2 { margin: 10px 0 6px; font-size: 1.6rem; letter-spacing: -0.02em; }
.summary { margin: 0 0 14px; color: var(--muted); line-height: 1.5; }
.chips { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.chips li { padding: 6px 10px; border-radius: 999px; background: var(--surface-2); border: 1px solid var(--border); font-size: .82rem; }
.block { padding: 18px; margin-bottom: 14px; }
.block-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12px; }
.block-head h3 { margin: 0; font-size: 1.05rem; }
.modules { list-style: none; margin: 0 0 14px; padding: 0; }
.modules li { display: flex; justify-content: space-between; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border); }
.modules strong { display: block; }
.modules p { margin: 4px 0 0; color: var(--muted); font-size: .88rem; }
.mod-side { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; color: var(--muted); }
.empty-inline { color: var(--muted); margin: 0 0 12px; }
.inline-form, .cohort-form { display: grid; grid-template-columns: 1.4fr 80px 1.6fr auto; gap: 8px; }
.cohort-form { grid-template-columns: 1.2fr 1fr 1fr 1.2fr 1fr 80px 1fr auto; margin-top: 12px; }
.narrow { max-width: 90px; }
.table-wrap { overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; font-size: .9rem; }
.table th { text-align: left; color: var(--muted); font-weight: 500; font-size: .78rem; padding: 8px 10px; border-bottom: 1px solid var(--border); }
.table td { padding: 12px 10px; border-bottom: 1px solid var(--border); vertical-align: middle; }
.cap { text-transform: capitalize; }
.scrim { position: fixed; inset: 0; background: rgb(10 10 10 / 30%); z-index: 60; display: grid; place-items: center; padding: 16px; }
.dialog { width: min(520px, 100%); background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 20px; max-height: min(90vh, 800px); overflow: auto; }
.dialog.wide { width: min(720px, 100%); }
.dialog header { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; margin-bottom: 14px; }
.dialog h2 { margin: 0; font-size: 1.25rem; }
.dialog-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 12px; }
.check { display: flex; align-items: center; gap: 8px; margin: 14px 0; font-size: .92rem; }
.dialog-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
.enroll-filters { display: flex; gap: 8px; margin-bottom: 12px; }
.enroll-list { list-style: none; margin: 0; padding: 0; }
.enroll-list li { display: grid; grid-template-columns: 1fr 130px; gap: 8px; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border); }
.enroll-row { display: flex; justify-content: space-between; gap: 10px; align-items: center; width: 100%; border: 0; background: none; font: inherit; color: inherit; cursor: pointer; text-align: left; padding: 6px; border-radius: 10px; }
.enroll-row:hover { background: var(--accent-soft); }
.enroll-row strong { display: block; }
.enroll-row span:not(.badge) { color: var(--muted); font-size: .85rem; }
.status-inline { height: 34px; font-size: .82rem; text-transform: capitalize; }

@media (max-width: 900px) {
  .inline-form, .cohort-form { grid-template-columns: 1fr 1fr; }
  .enroll-list li { grid-template-columns: 1fr; }
}
@media (max-width: 560px) {
  .toolbar { flex-direction: column; align-items: stretch; }
  .dialog-grid, .enroll-filters { grid-template-columns: 1fr; display: grid; }
}
</style>
