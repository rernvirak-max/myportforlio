<script setup>
import { reactive, ref } from 'vue'
import AdminDrawer from './AdminDrawer.vue'
import { COHORT_FORMATS, COHORT_STATUSES, CURRENCIES, FORMAT_LABEL, createCohort, fieldErrors, updateCohort } from '../../admin/courseApi.js'
import { toast, toastError } from '../../admin/toast.js'

// mode: 'new' | 'edit' | 'duplicate'
const props = defineProps({ course: { type: Object, required: true }, cohort: Object, mode: { type: String, default: 'new' } })
const emit = defineEmits(['close', 'saved'])

const src = props.cohort || {}
const form = reactive({
  title: props.mode === 'duplicate' ? `${src.title} (copy)` : src.title || '',
  start_date: props.mode === 'edit' ? src.start_date || '' : '',
  end_date: props.mode === 'edit' ? src.end_date || '' : '',
  schedule_text: src.schedule_text || '',
  format: src.format || 'online',
  seats: src.seats ?? 12,
  // Cohort resource falls back to the course min; only send an override when it differs.
  min_students: src.min_students && src.min_students !== props.course.min_students ? src.min_students : '',
  price: src.price === null || src.price === undefined ? '' : Number(src.price),
  currency: src.currency || 'USD',
  status: props.mode === 'edit' ? src.status || 'draft' : 'draft',
})
const errors = ref({})
const saving = ref(false)
const title = { new: 'New class', edit: 'Edit class', duplicate: 'Duplicate class' }[props.mode]

function validate() {
  const e = {}
  if (!form.title.trim()) e.title = 'Title is required.'
  if (!(Number(form.seats) >= 1 && Number(form.seats) <= 500)) e.seats = 'Seats must be between 1 and 500.'
  if (form.min_students !== '' && !(Number(form.min_students) >= 1 && Number(form.min_students) <= 500)) e.min_students = 'Between 1 and 500, or leave empty.'
  if (form.min_students !== '' && Number(form.min_students) > Number(form.seats)) e.min_students = 'Minimum can’t exceed seats.'
  if (form.price !== '' && Number(form.price) < 0) e.price = 'Price can’t be negative.'
  if (form.start_date && form.end_date && form.end_date < form.start_date) e.end_date = 'End date must be on or after the start date.'
  errors.value = e
  return !Object.keys(e).length
}

async function submit() {
  if (!validate()) return
  saving.value = true
  const body = {
    title: form.title.trim(),
    start_date: form.start_date || null,
    end_date: form.end_date || null,
    schedule_text: form.schedule_text.trim() || null,
    format: form.format,
    seats: Number(form.seats),
    min_students: form.min_students === '' ? null : Number(form.min_students),
    price: form.price === '' ? null : Number(form.price),
    currency: form.currency,
    status: form.status,
  }
  try {
    const saved = props.mode === 'edit' ? await updateCohort(props.course.id, src.id, body) : await createCohort(props.course.id, body)
    toast(props.mode === 'edit' ? 'Class saved.' : `Class “${saved.title}” created.`)
    emit('saved', saved)
  } catch (e) { errors.value = fieldErrors(e); toastError(e) } finally { saving.value = false }
}
</script>

<template>
  <AdminDrawer :title="title" :subtitle="course.title" @close="emit('close')">
    <form id="cohort-form" class="g" novalidate @submit.prevent="submit">
      <div class="adm-field full" :class="{ invalid: errors.title }"><label class="adm-label" for="ch-title">Title</label><input id="ch-title" v-model="form.title" class="adm-input" maxlength="160" placeholder="e.g. Evening class — Jan 2027" /><small v-if="errors.title" class="adm-err">{{ errors.title }}</small></div>
      <div class="adm-field" :class="{ invalid: errors.start_date }"><label class="adm-label" for="ch-sd">Start date</label><input id="ch-sd" v-model="form.start_date" type="date" class="adm-input" /><small v-if="errors.start_date" class="adm-err">{{ errors.start_date }}</small></div>
      <div class="adm-field" :class="{ invalid: errors.end_date }"><label class="adm-label" for="ch-ed">End date</label><input id="ch-ed" v-model="form.end_date" type="date" :min="form.start_date || undefined" class="adm-input" /><small v-if="errors.end_date" class="adm-err">{{ errors.end_date }}</small></div>
      <div class="adm-field full" :class="{ invalid: errors.schedule_text }"><label class="adm-label" for="ch-sch">Schedule</label><input id="ch-sch" v-model="form.schedule_text" class="adm-input" maxlength="255" placeholder="Mon & Wed · 7–9pm (ICT)" /><small v-if="errors.schedule_text" class="adm-err">{{ errors.schedule_text }}</small></div>
      <div class="adm-field full" :class="{ invalid: errors.format }"><span class="adm-label">Format</span>
        <div class="seg"><button v-for="f in COHORT_FORMATS" :key="f" type="button" :class="{ on: form.format === f }" @click="form.format = f">{{ FORMAT_LABEL[f] }}</button></div>
        <small v-if="errors.format" class="adm-err">{{ errors.format }}</small></div>
      <div class="adm-field" :class="{ invalid: errors.seats }"><label class="adm-label" for="ch-seats">Seats</label><input id="ch-seats" v-model="form.seats" type="number" min="1" max="500" class="adm-input" /><small v-if="errors.seats" class="adm-err">{{ errors.seats }}</small></div>
      <div class="adm-field" :class="{ invalid: errors.min_students }"><label class="adm-label" for="ch-min">Min students to open</label><input id="ch-min" v-model="form.min_students" type="number" min="1" max="500" class="adm-input" :placeholder="course.min_students ? `Course default: ${course.min_students}` : 'Course default'" /><small v-if="errors.min_students" class="adm-err">{{ errors.min_students }}</small><small v-else class="adm-help">Empty = use the course minimum.</small></div>
      <div class="adm-field" :class="{ invalid: errors.price }"><label class="adm-label" for="ch-price">Price</label><input id="ch-price" v-model="form.price" type="number" min="0" step="0.01" class="adm-input" placeholder="Price on request" /><small v-if="errors.price" class="adm-err">{{ errors.price }}</small><small v-else-if="form.price === ''" class="adm-help">Shown as “Price on request”.</small></div>
      <div class="adm-field" :class="{ invalid: errors.currency }"><label class="adm-label" for="ch-cur">Currency</label><select id="ch-cur" v-model="form.currency" class="adm-select"><option v-for="c in CURRENCIES" :key="c" :value="c">{{ c }}</option></select><small v-if="errors.currency" class="adm-err">{{ errors.currency }}</small></div>
      <div class="adm-field full" :class="{ invalid: errors.status }"><span class="adm-label">Status</span>
        <div class="seg"><button v-for="s in COHORT_STATUSES" :key="s" type="button" :class="{ on: form.status === s }" @click="form.status = s">{{ s }}</button></div>
        <small v-if="errors.status" class="adm-err">{{ errors.status }}</small></div>
    </form>
    <template #footer>
      <button class="adm-btn pill" type="button" @click="emit('close')">Cancel</button>
      <button class="adm-btn primary pill" type="submit" form="cohort-form" :disabled="saving">{{ saving ? 'Saving…' : mode === 'edit' ? 'Save class' : 'Create class' }}</button>
    </template>
  </AdminDrawer>
</template>

<style scoped>
.g { display: grid; grid-template-columns: 1fr 1fr; gap: 0 12px; } .full { grid-column: 1 / -1; }
.seg { display: flex; flex-wrap: wrap; gap: 6px; padding: 4px; background: #fafaf9; border: 1px solid var(--border); border-radius: 999px; }
.seg button { flex: 1; height: 34px; border: 0; border-radius: 999px; background: none; font: inherit; font-size: .88rem; color: var(--muted); cursor: pointer; text-transform: capitalize; }
.seg button.on { background: #4F46E5; color: #fff; font-weight: 500; }
@media (max-width: 640px) { .g { grid-template-columns: 1fr; } }
</style>
