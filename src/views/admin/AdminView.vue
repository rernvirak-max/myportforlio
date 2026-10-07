<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { api, apiConfigured, clearToken, setUnauthorizedHandler } from '../../admin/api.js'
import './admin.css'

const STATUSES = ['new', 'contacted', 'enrolled', 'declined']
const LANG = { en: 'English', km: 'Khmer' }
const FORMAT = { online: 'Online', in_person: 'In person', either: 'Either' }

const router = useRouter()
const user = ref(null)
const stats = ref({ total: 0, by_status: {} })
const rows = ref([])
const meta = reactive({ current_page: 1, last_page: 1, total: 0, from: 0, to: 0 })
const filters = reactive({ status: '', search: '', page: 1 })
const loading = ref(false)
const error = ref('')
const flash = ref('')

const selected = ref(null)
const edit = reactive({ status: 'new', admin_note: '' })
const saving = ref(false)
const panelError = ref('')
const exporting = ref(false)

setUnauthorizedHandler(() => router.replace({ name: 'admin-login', query: { expired: 1 } }))

const query = () => {
  const p = new URLSearchParams()
  if (filters.status) p.set('status', filters.status)
  if (filters.search.trim()) p.set('search', filters.search.trim())
  return p
}

async function loadStats() {
  try {
    stats.value = await api('/admin/stats')
  } catch (e) {
    if (e.status !== 401) error.value = e.message
  }
}

async function loadList() {
  loading.value = true
  error.value = ''
  try {
    const p = query()
    p.set('page', filters.page)
    const data = await api(`/admin/course-enquiries?${p}`)
    rows.value = data.data
    Object.assign(meta, { current_page: data.current_page, last_page: data.last_page, total: data.total, from: data.from || 0, to: data.to || 0 })
  } catch (e) {
    if (e.status !== 401) error.value = e.message
  } finally {
    loading.value = false
  }
}

const refresh = () => Promise.all([loadList(), loadStats()])

let searchTimer
watch(() => filters.search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { filters.page = 1; loadList() }, 300)
})
watch(() => filters.status, () => { filters.page = 1; loadList() })

function goPage(n) {
  if (n < 1 || n > meta.last_page) return
  filters.page = n
  loadList()
}

function open(row) {
  selected.value = row
  edit.status = row.status
  edit.admin_note = row.admin_note || ''
  panelError.value = ''
}
const close = () => { selected.value = null }
const onKey = (e) => { if (e.key === 'Escape') close() }

async function save() {
  saving.value = true
  panelError.value = ''
  try {
    const { data } = await api(`/admin/course-enquiries/${selected.value.id}`, {
      method: 'PATCH',
      body: { status: edit.status, admin_note: edit.admin_note || null },
    })
    const i = rows.value.findIndex((r) => r.id === data.id)
    if (i !== -1) rows.value[i] = data
    selected.value = data
    flash.value = `Saved ${data.name}.`
    loadStats()
  } catch (e) {
    panelError.value = e.message
  } finally {
    saving.value = false
  }
}

async function remove() {
  const row = selected.value
  if (!window.confirm(`Delete the request from ${row.name}? This cannot be undone.`)) return
  saving.value = true
  panelError.value = ''
  try {
    await api(`/admin/course-enquiries/${row.id}`, { method: 'DELETE' })
    close()
    flash.value = `Deleted the request from ${row.name}.`
    if (rows.value.length === 1 && filters.page > 1) filters.page--
    refresh()
  } catch (e) {
    panelError.value = e.message
  } finally {
    saving.value = false
  }
}

async function exportCsv() {
  exporting.value = true
  error.value = ''
  try {
    const res = await api(`/admin/course-enquiries/export?${query()}`, { raw: true })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `course-requests-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  } catch (e) {
    if (e.status !== 401) error.value = `Export failed: ${e.message}`
  } finally {
    exporting.value = false
  }
}

async function logout() {
  try {
    await api('/admin/logout', { method: 'POST' })
  } catch {
    /* token may already be invalid — sign out locally anyway */
  }
  clearToken()
  router.replace({ name: 'admin-login' })
}

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''

// Contact field is free text: Telegram @handle, t.me link, or phone number.
function telegramLink(contact) {
  const c = (contact || '').trim()
  const handle = c.match(/^(?:@|(?:https?:\/\/)?t\.me\/)([A-Za-z0-9_]{4,32})$/)
  if (handle) return `https://t.me/${handle[1]}`
  const digits = c.replace(/[^\d+]/g, '')
  if (/^\+?\d{8,15}$/.test(digits)) {
    const intl = digits.startsWith('+') ? digits : digits.startsWith('0') ? `+855${digits.slice(1)}` : `+${digits}`
    return `https://t.me/${intl}`
  }
  return null
}
const mailto = (r) => `mailto:${r.email}?subject=${encodeURIComponent('Your full-stack course enquiry')}&body=${encodeURIComponent(`Hi ${r.name},\n\n`)}`

const dirty = computed(() => selected.value && (edit.status !== selected.value.status || (edit.admin_note || '') !== (selected.value.admin_note || '')))

watch(flash, (v) => { if (v) setTimeout(() => { if (flash.value === v) flash.value = '' }, 3500) })

onMounted(async () => {
  window.addEventListener('keydown', onKey)
  if (!apiConfigured) return
  try {
    user.value = (await api('/admin/me')).user
  } catch (e) {
    if (e.status !== 401) error.value = e.message
  }
  refresh()
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  setUnauthorizedHandler(() => {})
})
</script>

<template>
  <div class="adm">
    <div class="adm-wrap">
      <header class="adm-top">
        <div>
          <h1>Course requests</h1>
          <p v-if="user">Signed in as {{ user.email }}</p>
        </div>
        <div class="top-actions">
          <button class="adm-btn" type="button" :disabled="exporting || !apiConfigured" @click="exportCsv">
            {{ exporting ? 'Exporting…' : 'Export CSV' }}
          </button>
          <button class="adm-btn" type="button" @click="logout">Log out</button>
        </div>
      </header>

      <div v-if="!apiConfigured" class="adm-alert info">
        API not configured. Set <code>VITE_API_URL</code> to the engine URL and rebuild the site.
      </div>
      <div v-if="error" class="adm-alert error" role="alert">
        {{ error }} <button class="link" type="button" @click="refresh">Try again</button>
      </div>
      <div v-if="flash" class="adm-alert ok" role="status">{{ flash }}</div>

      <section class="stats">
        <button type="button" class="adm-card stat" :class="{ active: !filters.status }" @click="filters.status = ''">
          <span class="stat-label">All</span><span class="stat-num">{{ stats.total }}</span>
        </button>
        <button v-for="s in STATUSES" :key="s" type="button" class="adm-card stat" :class="{ active: filters.status === s }" @click="filters.status = s">
          <span class="stat-label"><span class="dot" :class="s" />{{ s }}</span>
          <span class="stat-num">{{ stats.by_status[s] ?? 0 }}</span>
        </button>
      </section>

      <section class="adm-card list">
        <div class="toolbar">
          <input v-model="filters.search" class="adm-input" type="search" placeholder="Search name, email or contact" aria-label="Search" />
          <select v-model="filters.status" class="adm-select" aria-label="Filter by status">
            <option value="">All statuses</option>
            <option v-for="s in STATUSES" :key="s" :value="s">{{ s[0].toUpperCase() + s.slice(1) }}</option>
          </select>
        </div>

        <div v-if="loading && !rows.length" class="empty">Loading…</div>
        <div v-else-if="!rows.length" class="empty">
          {{ filters.search || filters.status ? 'No requests match these filters.' : 'No course requests yet.' }}
        </div>

        <table v-else class="table" :class="{ busy: loading }">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Contact</th><th>Language</th><th>Format</th><th>Level</th><th>Date</th><th>Status</th></tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.id" tabindex="0" :class="{ sel: selected?.id === r.id }" @click="open(r)" @keydown.enter="open(r)">
              <td class="name" data-label="Name">{{ r.name }}</td>
              <td data-label="Email">{{ r.email }}</td>
              <td data-label="Contact">{{ r.contact || '—' }}</td>
              <td data-label="Language">{{ LANG[r.language] || r.language }}</td>
              <td data-label="Format">{{ FORMAT[r.format] || r.format }}</td>
              <td data-label="Level">{{ r.level }}</td>
              <td data-label="Date" class="date">{{ fmtDate(r.created_at) }}</td>
              <td data-label="Status"><span class="badge" :class="r.status">{{ r.status }}</span></td>
            </tr>
          </tbody>
        </table>

        <nav v-if="meta.total" class="pager" aria-label="Pagination">
          <span>{{ meta.from }}–{{ meta.to }} of {{ meta.total }}</span>
          <div>
            <button class="adm-btn sm" type="button" :disabled="meta.current_page <= 1 || loading" @click="goPage(meta.current_page - 1)">Previous</button>
            <span class="pg">Page {{ meta.current_page }} / {{ meta.last_page }}</span>
            <button class="adm-btn sm" type="button" :disabled="meta.current_page >= meta.last_page || loading" @click="goPage(meta.current_page + 1)">Next</button>
          </div>
        </nav>
      </section>
    </div>

    <Transition name="fade">
      <div v-if="selected" class="scrim" @click="close" />
    </Transition>
    <Transition name="slide">
      <aside v-if="selected" class="panel" role="dialog" aria-modal="true" :aria-label="`Request from ${selected.name}`">
        <header class="panel-head">
          <div>
            <h2>{{ selected.name }}</h2>
            <p>{{ fmtDate(selected.created_at) }}</p>
          </div>
          <button class="adm-btn sm" type="button" aria-label="Close" @click="close">✕</button>
        </header>

        <div class="quick">
          <a class="adm-btn sm" :href="mailto(selected)">Email</a>
          <a v-if="telegramLink(selected.contact)" class="adm-btn sm" :href="telegramLink(selected.contact)" target="_blank" rel="noopener">Telegram</a>
        </div>

        <dl class="facts">
          <div><dt>Email</dt><dd>{{ selected.email }}</dd></div>
          <div><dt>Contact</dt><dd>{{ selected.contact || '—' }}</dd></div>
          <div><dt>Language</dt><dd>{{ LANG[selected.language] || selected.language }}</dd></div>
          <div><dt>Format</dt><dd>{{ FORMAT[selected.format] || selected.format }}</dd></div>
          <div class="wide"><dt>Level</dt><dd>{{ selected.level }}</dd></div>
        </dl>

        <h3>Message</h3>
        <p class="msg">{{ selected.message || 'No message.' }}</p>

        <div v-if="panelError" class="adm-alert error" role="alert">{{ panelError }}</div>

        <label class="adm-label" for="st">Status</label>
        <select id="st" v-model="edit.status" class="adm-select">
          <option v-for="s in STATUSES" :key="s" :value="s">{{ s[0].toUpperCase() + s.slice(1) }}</option>
        </select>
        <label class="adm-label" for="note" style="margin-top: 14px">Private note</label>
        <textarea id="note" v-model="edit.admin_note" class="adm-textarea" maxlength="5000" placeholder="e.g. Called on Monday, starts next intake" />

        <div class="panel-actions">
          <button class="adm-btn danger" type="button" :disabled="saving" @click="remove">Delete</button>
          <button class="adm-btn primary" type="button" :disabled="saving || !dirty" @click="save">{{ saving ? 'Saving…' : 'Save changes' }}</button>
        </div>
      </aside>
    </Transition>
  </div>
</template>

<style scoped>
.top-actions { display: flex; gap: 8px; }
.link { background: none; border: 0; padding: 0; color: inherit; font: inherit; text-decoration: underline; cursor: pointer; }
.stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 16px; }
.stat { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; padding: 16px 18px; font: inherit; color: inherit; text-align: left; cursor: pointer; }
.stat:hover { border-color: var(--accent-line); }
.stat.active { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
.stat-label { display: inline-flex; align-items: center; gap: 8px; color: var(--muted); font-size: .88rem; text-transform: capitalize; }
.stat-num { font-size: 1.75rem; font-weight: 700; letter-spacing: -0.02em; }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.dot.new { background: var(--accent); } .dot.contacted { background: #f59e0b; } .dot.enrolled { background: #16a34a; } .dot.declined { background: #a3a3a3; }
.list { overflow: hidden; }
.toolbar { display: flex; gap: 10px; padding: 14px; border-bottom: 1px solid var(--border); }
.toolbar .adm-select { max-width: 200px; }
.empty { padding: 48px 16px; text-align: center; color: var(--muted); }
.table { width: 100%; border-collapse: collapse; font-size: .9rem; }
.table.busy { opacity: .6; }
.table th { text-align: left; font-weight: 500; color: var(--muted); font-size: .8rem; padding: 10px 14px; background: var(--surface-2); border-bottom: 1px solid var(--border); }
.table td { padding: 12px 14px; border-bottom: 1px solid var(--border); vertical-align: middle; }
.table tbody tr { cursor: pointer; }
.table tbody tr:hover, .table tbody tr.sel { background: var(--accent-soft); }
.table tbody tr:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }
.name { font-weight: 600; }
.date { white-space: nowrap; color: var(--muted); }
.pager { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 12px 14px; font-size: .88rem; color: var(--muted); }
.pager > div { display: flex; align-items: center; gap: 8px; }
.scrim { position: fixed; inset: 0; background: rgb(10 10 10 / 25%); z-index: 40; }
.panel { position: fixed; top: 0; right: 0; bottom: 0; width: min(480px, 100%); background: var(--surface); border-left: 1px solid var(--border); z-index: 50; overflow-y: auto; padding: 22px 24px 32px; box-shadow: -12px 0 32px rgb(0 0 0 / 8%); }
.panel-head { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
.panel-head h2 { margin: 0; font-size: 1.35rem; letter-spacing: -0.02em; }
.panel-head p { margin: 2px 0 0; color: var(--muted); font-size: .88rem; }
.quick { display: flex; gap: 8px; margin: 16px 0; }
.facts { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 0 0 18px; padding: 14px; background: var(--surface-2); border-radius: 12px; }
.facts .wide { grid-column: 1 / -1; }
.facts dt { font-size: .78rem; color: var(--muted); }
.facts dd { margin: 2px 0 0; font-weight: 500; word-break: break-word; }
h3 { font-size: .85rem; color: var(--muted); font-weight: 500; margin: 0 0 6px; }
.msg { white-space: pre-wrap; margin: 0 0 20px; line-height: 1.55; padding: 14px; border: 1px solid var(--border); border-radius: 12px; }
.panel-actions { display: flex; justify-content: space-between; gap: 10px; margin-top: 20px; }
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-enter-active, .slide-leave-active { transition: transform .25s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }

@media (max-width: 900px) {
  .stats { grid-template-columns: repeat(3, 1fr); }
  .table thead { display: none; }
  .table, .table tbody, .table tr, .table td { display: block; }
  .table tbody { display: grid; gap: 10px; padding: 12px; }
  .table tr { border: 1px solid var(--border); border-radius: 12px; padding: 12px 14px; display: flex; flex-wrap: wrap; align-items: center; gap: 4px 0; }
  .table td { border: 0; padding: 0; font-size: .86rem; color: var(--muted); }
  .table td.name { color: var(--text); font-size: 1rem; flex: 1 1 60%; order: 0; }
  .table td[data-label="Status"] { order: 1; margin-left: auto; }
  .table td[data-label="Email"] { order: 2; flex-basis: 100%; word-break: break-all; color: var(--text-3); }
  .table td[data-label="Language"] { order: 3; }
  .table td[data-label="Format"] { order: 4; }
  .table td[data-label="Level"] { order: 5; }
  .table td[data-label="Format"]::before, .table td[data-label="Level"]::before { content: "·"; margin: 0 6px; }
  .table td[data-label="Contact"] { order: 6; flex-basis: 100%; }
  .table td[data-label="Date"] { order: 7; flex-basis: 100%; font-size: .8rem; }
}
@media (max-width: 560px) {
  .adm-wrap { padding: 16px 12px 48px; }
  .adm-top { flex-wrap: wrap; }
  .stats { grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .stats .stat:first-child { grid-column: 1 / -1; }
  .stat { padding: 12px 14px; }
  .stat-num { font-size: 1.4rem; }
  .toolbar { flex-direction: column; }
  .toolbar .adm-select { max-width: none; }
  .pager { flex-direction: column; }
  .panel { padding: 18px 16px 28px; }
}
</style>
