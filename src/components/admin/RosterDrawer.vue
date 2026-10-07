<script setup>
import { computed, onMounted, ref } from 'vue'
import AdminDrawer from './AdminDrawer.vue'
import { ENQUIRY_ACCEPTS_COHORT_ID, ENQUIRY_STATUSES, confirmedSeats, listEnquiries, updateEnquiry } from '../../admin/courseApi.js'
import { toast, toastError } from '../../admin/toast.js'

const props = defineProps({ course: { type: Object, required: true }, cohort: { type: Object, required: true } })
const emit = defineEmits(['close', 'changed'])

const loading = ref(true)
const roster = ref([])
const unassigned = ref([])
const error = ref('')
const min = computed(() => props.cohort.min_students || props.course.min_students || 0)
const pipeline = computed(() => roster.value.filter((r) => r.status !== 'declined').length)
const enrolled = computed(() => roster.value.filter((r) => r.status === 'enrolled').length)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [inClass, forCourse] = await Promise.all([
      listEnquiries({ course_id: props.course.id, cohort_id: props.cohort.id }),
      listEnquiries({ course_id: props.course.id }),
    ])
    roster.value = inClass
    unassigned.value = forCourse.filter((r) => !r.cohort_id && r.status !== 'declined')
  } catch (e) { if (e.status !== 401) error.value = e.message } finally { loading.value = false }
}

async function setStatus(row, status) {
  const prev = row.status
  row.status = status
  try {
    const saved = await updateEnquiry(row.id, { status })
    Object.assign(row, saved)
    toast(`${row.name} → ${status}`)
    emit('changed')
  } catch (e) { row.status = prev; toastError(e) }
}

async function assign(row) {
  if (!ENQUIRY_ACCEPTS_COHORT_ID) return
  try { await updateEnquiry(row.id, { cohort_id: props.cohort.id }); toast(`${row.name} assigned.`); await load(); emit('changed') } catch (e) { toastError(e) }
}
const contactOf = (r) => [r.email, r.contact].filter(Boolean).join(' · ') || '—'
onMounted(load)
</script>

<template>
  <AdminDrawer wide title="Class roster" :subtitle="`${cohort.title} · ${course.title}`" @close="emit('close')">
    <div class="sum tile">
      <div><span>Requests</span><strong>{{ pipeline }}<small v-if="min"> / {{ min }} min</small></strong></div>
      <div><span>Enrolled</span><strong>{{ enrolled }}<small> / {{ cohort.seats }} seats</small></strong></div>
      <div><span>Seats left</span><strong>{{ Math.max(0, cohort.seats - Math.max(enrolled, confirmedSeats(cohort))) }}</strong></div>
    </div>
    <div v-if="error" class="adm-alert error">{{ error }}</div>
    <div v-if="loading" class="muted pad">Loading roster…</div>
    <template v-else>
      <h3>In this class</h3>
      <p v-if="!roster.length" class="muted pad">No requests linked to this class yet.</p>
      <ul class="rows">
        <li v-for="r in roster" :key="r.id" class="tile row">
          <div class="who"><strong>{{ r.name }}</strong><span>{{ contactOf(r) }}</span></div>
          <div class="sts" role="group" :aria-label="`Status for ${r.name}`">
            <button v-for="s in ENQUIRY_STATUSES" :key="s" type="button" class="st" :class="[s, { on: r.status === s }]" @click="r.status !== s && setStatus(r, s)">{{ s }}</button>
          </div>
        </li>
      </ul>

      <h3>Unassigned requests for this course</h3>
      <div v-if="!ENQUIRY_ACCEPTS_COHORT_ID" class="adm-alert info small">
        Read-only: the engine’s enquiry PATCH only accepts <code>status</code> and <code>admin_note</code>, so requests can’t be moved into a class from here yet.
      </div>
      <p v-if="!unassigned.length" class="muted pad">No unassigned requests.</p>
      <ul class="rows">
        <li v-for="r in unassigned" :key="r.id" class="tile row">
          <div class="who"><strong>{{ r.name }}</strong><span>{{ contactOf(r) }}</span></div>
          <span class="badge" :class="r.status">{{ r.status }}</span>
          <button v-if="ENQUIRY_ACCEPTS_COHORT_ID" class="adm-btn sm pill" type="button" @click="assign(r)">Assign</button>
        </li>
      </ul>
    </template>
  </AdminDrawer>
</template>

<style scoped>
.tile { background: #fff; border: 1px solid var(--border); border-radius: 20px; }
.sum { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 14px; background: #fafaf9; margin-bottom: 16px; }
.sum span { display: block; font-size: .75rem; color: var(--muted); } .sum strong { font-size: 1.3rem; } .sum small { font-size: .8rem; color: var(--muted); font-weight: 400; }
h3 { font-size: .95rem; margin: 18px 0 10px; }
.muted { color: var(--muted); } .pad { padding: 8px 0; margin: 0; }
.rows { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
.row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 12px 14px; flex-wrap: wrap; }
.who { min-width: 0; flex: 1; } .who strong { display: block; } .who span { color: var(--muted); font-size: .84rem; word-break: break-all; }
.sts { display: flex; gap: 4px; flex-wrap: wrap; }
.st { height: 30px; padding: 0 11px; border-radius: 999px; border: 1px solid var(--border); background: #fff; font: inherit; font-size: .78rem; text-transform: capitalize; cursor: pointer; color: var(--muted); }
.st.on.new { background: #eef2ff; color: #4338ca; border-color: #c7d2fe; } .st.on.contacted { background: #fffbeb; color: #92400e; border-color: #fde68a; }
.st.on.enrolled { background: #f0fdf4; color: #166534; border-color: #bbf7d0; } .st.on.declined { background: #f4f4f5; color: #3f3f46; border-color: #d4d4d8; }
.st.on { font-weight: 600; }
.small { font-size: .84rem; }
@media (max-width: 640px) { .sts { width: 100%; } .st { flex: 1; padding: 0 4px; } }
</style>
