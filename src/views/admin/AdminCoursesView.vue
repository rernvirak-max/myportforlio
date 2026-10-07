<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiConfigured } from '../../admin/api.js'
import { confirmedSeats, createCourse, fieldErrors, listCourses, slugify } from '../../admin/courseApi.js'
import { toast, toastError } from '../../admin/toast.js'
import AdminDrawer from '../../components/admin/AdminDrawer.vue'
import AdminToasts from '../../components/admin/AdminToasts.vue'

const router = useRouter()
const loading = ref(false)
const error = ref('')
const courses = ref([])

const showCreate = ref(false)
const creating = ref(false)
const errors = ref({})
const slugTouched = ref(false)
const form = reactive({ title: '', slug: '', summary: '', hours: 60 })

const stats = (c) => {
  const cohorts = c.cohorts || []
  return {
    classes: cohorts.length,
    open: cohorts.filter((x) => x.status === 'open').length,
    enrolled: cohorts.reduce((n, x) => n + confirmedSeats(x), 0),
    requests: c.enquiries_count ?? 0,
  }
}

async function load() {
  if (!apiConfigured) return
  loading.value = true
  error.value = ''
  try {
    courses.value = await listCourses()
  } catch (e) {
    if (e.status !== 401) error.value = e.message
  } finally {
    loading.value = false
  }
}

function onTitle() {
  if (!slugTouched.value) form.slug = slugify(form.title)
}

async function submit() {
  errors.value = {}
  if (!form.title.trim()) errors.value.title = 'Title is required.'
  if (!/^[a-z0-9_-]+$/i.test(form.slug)) errors.value.slug = 'Use letters, numbers, dashes or underscores.'
  if (Object.keys(errors.value).length) return
  creating.value = true
  try {
    const course = await createCourse({
      title: form.title.trim(),
      slug: form.slug,
      summary: form.summary || null,
      hours: form.hours === '' ? null : Number(form.hours),
      languages: ['English', 'Khmer'],
      is_published: false,
    })
    toast(`Created “${course.title}” as a draft.`)
    showCreate.value = false
    router.push({ name: 'admin-course-edit', params: { id: course.id } })
  } catch (e) {
    errors.value = fieldErrors(e)
    toastError(e)
  } finally {
    creating.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="cl">
    <AdminToasts />
    <div v-if="!apiConfigured" class="adm-alert info">The admin API is not configured.</div>
    <div v-if="error" class="adm-alert error" role="alert">{{ error }}</div>

    <div class="toolbar">
      <p class="hint">Courses hold the outline; <strong>classes</strong> are the dated cohorts students join. Published courses appear on the public site.</p>
      <button class="adm-btn primary pill" type="button" @click="showCreate = true"><i class="bi bi-plus-lg"></i> New course</button>
    </div>

    <div v-if="loading" class="empty">Loading courses…</div>
    <div v-else-if="!courses.length && apiConfigured" class="empty tile">No courses yet — create the first one.</div>

    <div v-else class="grid">
      <RouterLink v-for="c in courses" :key="c.id" class="tile card" :to="{ name: 'admin-course-edit', params: { id: c.id } }">
        <div class="card-top">
          <span class="pill-st" :class="c.is_published ? 'published' : 'draft'">{{ c.is_published ? 'Published' : 'Draft' }}</span>
          <span class="slug">/{{ c.slug }}</span>
        </div>
        <h2>{{ c.title }}</h2>
        <p>{{ c.summary || 'No summary yet.' }}</p>
        <dl class="kpis">
          <div><dt>Hours</dt><dd>{{ c.hours ?? 0 }}</dd></div>
          <div><dt>Classes</dt><dd>{{ stats(c).classes }}</dd></div>
          <div><dt>Open</dt><dd class="accent">{{ stats(c).open }}</dd></div>
          <div><dt>Enrolled</dt><dd>{{ stats(c).enrolled }}</dd></div>
        </dl>
        <div class="card-foot">
          <span>{{ stats(c).requests }} requests</span>
          <span class="go">Manage <i class="bi bi-arrow-right"></i></span>
        </div>
      </RouterLink>
    </div>

    <AdminDrawer v-if="showCreate" title="New course" subtitle="Starts as a draft. Add modules and classes next." @close="showCreate = false">
      <form id="new-course" @submit.prevent="submit">
        <div class="adm-field" :class="{ invalid: errors.title }">
          <label class="adm-label" for="nc-title">Title</label>
          <input id="nc-title" v-model="form.title" class="adm-input" maxlength="160" @input="onTitle" />
          <small v-if="errors.title" class="adm-err">{{ errors.title }}</small>
        </div>
        <div class="adm-field" :class="{ invalid: errors.slug }">
          <label class="adm-label" for="nc-slug">Slug</label>
          <input id="nc-slug" v-model="form.slug" class="adm-input" maxlength="180" @input="slugTouched = true" />
          <small v-if="errors.slug" class="adm-err">{{ errors.slug }}</small>
          <small v-else class="adm-help">/courses/{{ form.slug || '…' }}</small>
        </div>
        <div class="adm-field" :class="{ invalid: errors.hours }">
          <label class="adm-label" for="nc-hours">Hours</label>
          <input id="nc-hours" v-model="form.hours" type="number" min="0" max="1000" class="adm-input" />
          <small v-if="errors.hours" class="adm-err">{{ errors.hours }}</small>
        </div>
        <div class="adm-field" :class="{ invalid: errors.summary }">
          <label class="adm-label" for="nc-sum">Summary</label>
          <textarea id="nc-sum" v-model="form.summary" class="adm-textarea" maxlength="5000"></textarea>
          <small v-if="errors.summary" class="adm-err">{{ errors.summary }}</small>
        </div>
      </form>
      <template #footer>
        <button class="adm-btn pill" type="button" @click="showCreate = false">Cancel</button>
        <button class="adm-btn primary pill" type="submit" form="new-course" :disabled="creating">{{ creating ? 'Creating…' : 'Create course' }}</button>
      </template>
    </AdminDrawer>
  </div>
</template>

<style scoped>
.toolbar { display: flex; justify-content: space-between; gap: 12px; align-items: center; margin-bottom: 18px; }
.hint { margin: 0; color: var(--muted); font-size: .92rem; max-width: 60ch; }
.empty { padding: 40px 16px; text-align: center; color: var(--muted); }
.tile { background: #fff; border: 1px solid var(--border); border-radius: 24px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
.card { display: flex; flex-direction: column; gap: 10px; padding: 22px; color: inherit; text-decoration: none; transition: box-shadow .15s, border-color .15s, transform .15s; }
.card:hover { border-color: #c7d2fe; box-shadow: 0 10px 30px rgb(79 70 229 / 10%); transform: translateY(-2px); }
.card-top, .card-foot { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.slug { color: var(--muted); font-size: .8rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.card h2 { margin: 4px 0 0; font-size: 1.2rem; letter-spacing: -0.02em; }
.card p { margin: 0; color: var(--muted); font-size: .9rem; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin: 6px 0 0; padding: 12px; background: #fafaf9; border-radius: 18px; }
.kpis div { text-align: center; } .kpis dt { font-size: .72rem; color: var(--muted); } .kpis dd { margin: 2px 0 0; font-size: 1.15rem; font-weight: 600; }
.kpis .accent { color: #4F46E5; }
.card-foot { color: var(--muted); font-size: .84rem; } .go { color: #4F46E5; font-weight: 500; }
@media (max-width: 640px) { .toolbar { flex-direction: column; align-items: stretch; } .grid { grid-template-columns: 1fr; } }
</style>
