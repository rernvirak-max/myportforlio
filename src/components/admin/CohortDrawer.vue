<script setup>
import { computed, reactive, ref } from 'vue'
import AdminDrawer from './AdminDrawer.vue'
import {
  COHORT_ACCEPTS_PAYMENT_OPTIONS, COHORT_FORMATS, COHORT_STATUSES, CURRENCIES, FORMAT_LABEL, PAYMENT_FIELDS,
  createCohort, fieldErrors, hasPaymentFields, updateCohort,
} from '../../admin/courseApi.js'
import { formatMoney, fmtShortDate, num, todayISO } from '../../data/paymentOptions.js'
import { toast, toastError } from '../../admin/toast.js'

// mode: 'new' | 'edit' | 'duplicate'
const props = defineProps({ course: { type: Object, required: true }, cohort: Object, mode: { type: String, default: 'new' } })
const emit = defineEmits(['close', 'saved'])

const src = props.cohort || {}
const blank = (v) => (v === null || v === undefined ? '' : v)
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
  // Payment options (all optional, class currency)
  installment_count: blank(src.installment_count),
  installment_amount: src.installment_amount == null ? '' : Number(src.installment_amount),
  deposit_amount: src.deposit_amount == null ? '' : Number(src.deposit_amount),
  early_bird_price: src.early_bird_price == null ? '' : Number(src.early_bird_price),
  early_bird_until: src.early_bird_until ? String(src.early_bird_until).slice(0, 10) : '',
  early_bird_seats: blank(src.early_bird_seats),
  referral_discount: src.referral_discount == null ? '' : Number(src.referral_discount),
})
const on = reactive({
  installments: src.installment_count != null || src.installment_amount != null,
  deposit: src.deposit_amount != null,
  early: src.early_bird_price != null,
  referral: src.referral_discount != null,
})
const errors = ref({})
const saving = ref(false)
const tried = ref(false)
const title = { new: 'New class', edit: 'Edit class', duplicate: 'Duplicate class' }[props.mode]

// ---- Payment options: live helpers + validation
const minOpen = computed(() => Number(form.min_students) || props.course.min_students || 4)
const money = (v) => formatMoney(v, form.currency)
const priceNum = computed(() => num(form.price))
const instTotal = computed(() => {
  const n = num(form.installment_count), a = num(form.installment_amount)
  return n && a ? n * a : null
})
const instCompare = computed(() => {
  if (instTotal.value === null || priceNum.value === null) return ''
  const d = Math.round((instTotal.value - priceNum.value) * 100) / 100
  if (d === 0) return 'same as the full price'
  return d > 0 ? `${money(d)} more than the full price (${money(priceNum.value)})` : `${money(-d)} less than the full price (${money(priceNum.value)})`
})
const ebSaving = computed(() => {
  const eb = num(form.early_bird_price)
  if (eb === null || priceNum.value === null || eb >= priceNum.value || priceNum.value <= 0) return ''
  return `Saves ${money(priceNum.value - eb)} (${Math.round(((priceNum.value - eb) / priceNum.value) * 100)}%) off ${money(priceNum.value)}.`
})
const ebPast = computed(() => form.early_bird_until && form.early_bird_until < todayISO())

const isInt = (v) => Number.isInteger(Number(v))
const payErrors = computed(() => {
  const e = {}
  const price = priceNum.value
  const amount = (key, label, { below = true } = {}) => {
    const v = num(form[key])
    if (form[key] === '' || v === null) e[key] = `Enter the ${label}.`
    else if (v <= 0) e[key] = 'Must be more than 0.'
    else if (form.currency === 'KHR' && !Number.isInteger(v)) e[key] = 'Use whole riel (no decimals).'
    else if (below && price !== null && v >= price) e[key] = `Must be less than the full price (${money(price)}).`
  }
  if (on.installments) {
    if (form.installment_count === '') e.installment_count = 'How many payments? (2–12)'
    else if (!isInt(form.installment_count) || Number(form.installment_count) < 2 || Number(form.installment_count) > 12) e.installment_count = 'Use a whole number from 2 to 12.'
    amount('installment_amount', 'amount per payment', { below: false })
  }
  if (on.deposit) amount('deposit_amount', 'deposit amount')
  if (on.early) {
    if (price === null) e.early_bird_price = 'Set the full price first — the early bird is a discount on it.'
    else amount('early_bird_price', 'early-bird price')
    if (!form.early_bird_until && form.early_bird_seats === '') e.early_bird_until = 'Add an end date, a seat limit, or both.'
    if (form.early_bird_seats !== '') {
      if (!isInt(form.early_bird_seats) || Number(form.early_bird_seats) < 1) e.early_bird_seats = 'Use a whole number, 1 or more.'
      else if (Number(form.early_bird_seats) > Number(form.seats)) e.early_bird_seats = `Can’t be more than the class seats (${form.seats}).`
    }
  }
  if (on.referral) amount('referral_discount', 'discount')
  return e
})
/** Live: show a payment error as soon as the field has input (or after a save attempt). */
const payErr = (key) => errors.value[key] || ((tried.value || form[key] !== '') && payErrors.value[key]) || ''
const hasPayErr = (...keys) => keys.some((k) => payErr(k))

// When the engine already returns cohorts without these keys, it doesn't store them yet.
const engineStoresPayments = computed(() => {
  const list = props.course.cohorts || []
  if (!list.length) return null // unknown
  return list.some(hasPaymentFields)
})
const payNote = computed(() => {
  if (!COHORT_ACCEPTS_PAYMENT_OPTIONS) return 'The engine doesn’t save payment options yet, so these settings aren’t sent. They’ll work once the backend update is live.'
  if (engineStoresPayments.value === false) return 'Heads-up: the engine doesn’t store payment options yet, so anything entered here won’t be kept until the backend update is live.'
  return ''
})

function paymentBody() {
  const n = (v) => (v === '' || v === null ? null : Number(v))
  return {
    installment_count: on.installments ? n(form.installment_count) : null,
    installment_amount: on.installments ? n(form.installment_amount) : null,
    deposit_amount: on.deposit ? n(form.deposit_amount) : null,
    early_bird_price: on.early ? n(form.early_bird_price) : null,
    early_bird_until: on.early && form.early_bird_until ? form.early_bird_until : null,
    early_bird_seats: on.early ? n(form.early_bird_seats) : null,
    referral_discount: on.referral ? n(form.referral_discount) : null,
  }
}

function validate() {
  const e = {}
  if (!form.title.trim()) e.title = 'Title is required.'
  if (!(Number(form.seats) >= 1 && Number(form.seats) <= 500)) e.seats = 'Seats must be between 1 and 500.'
  if (form.min_students !== '' && !(Number(form.min_students) >= 1 && Number(form.min_students) <= 500)) e.min_students = 'Between 1 and 500, or leave empty.'
  if (form.min_students !== '' && Number(form.min_students) > Number(form.seats)) e.min_students = 'Minimum can’t exceed seats.'
  if (form.price !== '' && Number(form.price) < 0) e.price = 'Price can’t be negative.'
  if (form.start_date && form.end_date && form.end_date < form.start_date) e.end_date = 'End date must be on or after the start date.'
  errors.value = e
  tried.value = true
  // Payment errors only block saving when they will actually be sent.
  const payBlock = COHORT_ACCEPTS_PAYMENT_OPTIONS && Object.keys(payErrors.value).length
  return !Object.keys(e).length && !payBlock
}

async function submit() {
  if (!validate()) return toast('Please fix the highlighted fields.', 'error')
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
  const pay = paymentBody()
  if (COHORT_ACCEPTS_PAYMENT_OPTIONS) Object.assign(body, pay)
  try {
    const saved = props.mode === 'edit' ? await updateCohort(props.course.id, src.id, body) : await createCohort(props.course.id, body)
    toast(props.mode === 'edit' ? 'Class saved.' : `Class “${saved.title}” created.`)
    const sentAny = COHORT_ACCEPTS_PAYMENT_OPTIONS && PAYMENT_FIELDS.some((k) => pay[k] !== null)
    if (sentAny && !hasPaymentFields(saved)) toast('Payment options weren’t stored — the engine needs its update first.', 'info', 5000)
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

      <!-- Payment options -->
      <section class="pay full" aria-labelledby="pay-title">
        <div class="pay-head">
          <h3 id="pay-title"><i class="bi bi-wallet2" aria-hidden="true"></i> Payment options</h3>
          <p class="adm-help">All optional. Amounts are in the class currency ({{ form.currency }}). Only the options you turn on show on the course page.</p>
        </div>
        <p v-if="payNote" class="adm-alert info note"><i class="bi bi-info-circle" aria-hidden="true"></i> {{ payNote }}</p>

        <!-- 1. Installments -->
        <div class="opt" :class="{ on: on.installments, bad: on.installments && hasPayErr('installment_count', 'installment_amount') }">
          <div class="opt-row">
            <div><strong>Monthly installments</strong><p>Split the fee into equal monthly payments.</p></div>
            <button type="button" class="switch" role="switch" :aria-checked="on.installments" aria-label="Monthly installments" :class="{ on: on.installments }" @click="on.installments = !on.installments"><span></span></button>
          </div>
          <div v-if="on.installments" class="opt-body">
            <div class="adm-field" :class="{ invalid: payErr('installment_count') }"><label class="adm-label" for="ch-ic">Number of payments</label><input id="ch-ic" v-model="form.installment_count" type="number" min="2" max="12" step="1" class="adm-input" placeholder="2–12" /><small v-if="payErr('installment_count')" class="adm-err">{{ payErr('installment_count') }}</small></div>
            <div class="adm-field" :class="{ invalid: payErr('installment_amount') }"><label class="adm-label" for="ch-ia">Amount per payment</label><input id="ch-ia" v-model="form.installment_amount" type="number" min="0" step="0.01" class="adm-input" /><small v-if="payErr('installment_amount')" class="adm-err">{{ payErr('installment_amount') }}</small></div>
            <p v-if="instTotal !== null" class="calc full"><i class="bi bi-calculator" aria-hidden="true"></i> {{ form.installment_count }} × {{ money(form.installment_amount) }} = <strong>{{ money(instTotal) }}</strong><template v-if="instCompare"> · {{ instCompare }}</template></p>
          </div>
        </div>

        <!-- 2. Deposit -->
        <div class="opt" :class="{ on: on.deposit, bad: on.deposit && hasPayErr('deposit_amount') }">
          <div class="opt-row">
            <div><strong>Deposit to hold a seat</strong><p>Pay the rest once the class reaches {{ minOpen }} students.</p></div>
            <button type="button" class="switch" role="switch" :aria-checked="on.deposit" aria-label="Deposit to hold a seat" :class="{ on: on.deposit }" @click="on.deposit = !on.deposit"><span></span></button>
          </div>
          <div v-if="on.deposit" class="opt-body">
            <div class="adm-field" :class="{ invalid: payErr('deposit_amount') }"><label class="adm-label" for="ch-dep">Deposit amount</label><input id="ch-dep" v-model="form.deposit_amount" type="number" min="0" step="0.01" class="adm-input" /><small v-if="payErr('deposit_amount')" class="adm-err">{{ payErr('deposit_amount') }}</small></div>
            <p v-if="num(form.deposit_amount) > 0" class="calc full"><i class="bi bi-chat-quote" aria-hidden="true"></i> Site says: “Hold your seat with a {{ money(form.deposit_amount) }} deposit. Pay the rest only when the class reaches {{ minOpen }} students. Full refund if the class doesn’t open.”</p>
          </div>
        </div>

        <!-- 3. Early bird -->
        <div class="opt" :class="{ on: on.early, bad: on.early && hasPayErr('early_bird_price', 'early_bird_until', 'early_bird_seats') }">
          <div class="opt-row">
            <div><strong>Early bird</strong><p>A lower price until a date and/or for the first seats.</p></div>
            <button type="button" class="switch" role="switch" :aria-checked="on.early" aria-label="Early bird" :class="{ on: on.early }" @click="on.early = !on.early"><span></span></button>
          </div>
          <div v-if="on.early" class="opt-body">
            <div class="adm-field full" :class="{ invalid: payErr('early_bird_price') }"><label class="adm-label" for="ch-ebp">Early-bird price</label><input id="ch-ebp" v-model="form.early_bird_price" type="number" min="0" step="0.01" class="adm-input" :placeholder="priceNum !== null ? `Less than ${money(priceNum)}` : 'Set the full price first'" /><small v-if="payErr('early_bird_price')" class="adm-err">{{ payErr('early_bird_price') }}</small><small v-else-if="ebSaving" class="adm-help">{{ ebSaving }}</small></div>
            <div class="adm-field" :class="{ invalid: payErr('early_bird_until') }"><label class="adm-label" for="ch-ebu">Ends on</label><input id="ch-ebu" v-model="form.early_bird_until" type="date" class="adm-input" /><small v-if="payErr('early_bird_until')" class="adm-err">{{ payErr('early_bird_until') }}</small><small v-else-if="ebPast" class="adm-help warn">This date has passed, so the early bird is hidden on the site.</small><small v-else-if="form.early_bird_until" class="adm-help">Last day: {{ fmtShortDate(form.early_bird_until) }}</small></div>
            <div class="adm-field" :class="{ invalid: payErr('early_bird_seats') }"><label class="adm-label" for="ch-ebs">First … seats</label><input id="ch-ebs" v-model="form.early_bird_seats" type="number" min="1" step="1" class="adm-input" placeholder="e.g. 4" /><small v-if="payErr('early_bird_seats')" class="adm-err">{{ payErr('early_bird_seats') }}</small><small v-else class="adm-help">Empty = no seat limit.</small></div>
          </div>
        </div>

        <!-- 4. Referral -->
        <div class="opt" :class="{ on: on.referral, bad: on.referral && hasPayErr('referral_discount') }">
          <div class="opt-row">
            <div><strong>Refer a friend</strong><p>Both students get the same discount.</p></div>
            <button type="button" class="switch" role="switch" :aria-checked="on.referral" aria-label="Refer a friend" :class="{ on: on.referral }" @click="on.referral = !on.referral"><span></span></button>
          </div>
          <div v-if="on.referral" class="opt-body">
            <div class="adm-field" :class="{ invalid: payErr('referral_discount') }"><label class="adm-label" for="ch-ref">Discount for each student</label><input id="ch-ref" v-model="form.referral_discount" type="number" min="0" step="0.01" class="adm-input" /><small v-if="payErr('referral_discount')" class="adm-err">{{ payErr('referral_discount') }}</small></div>
            <p v-if="num(form.referral_discount) > 0" class="calc full"><i class="bi bi-chat-quote" aria-hidden="true"></i> Site says: “Bring a friend: you both save {{ money(form.referral_discount) }}.” The enquiry form asks who referred them.</p>
          </div>
        </div>
      </section>
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
.pay { margin-top: 6px; padding-top: 18px; border-top: 1px solid var(--border); display: grid; gap: 10px; }
.pay-head h3 { margin: 0; font-size: 1.02rem; letter-spacing: -0.01em; display: flex; gap: 8px; align-items: center; } .pay-head h3 i { color: #4F46E5; }
.pay-head .adm-help { margin-top: 4px; }
.note { margin: 0; display: flex; gap: 8px; align-items: flex-start; border-radius: 16px; font-size: .86rem; }
.opt { border: 1px solid var(--border); border-radius: 20px; background: #fafaf9; padding: 12px 14px; transition: border-color .15s, background .15s; }
.opt.on { background: #fff; border-color: #c7d2fe; }
.opt.bad { border-color: #fecaca; }
.opt-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.opt-row strong { font-size: .95rem; } .opt-row p { margin: 2px 0 0; color: var(--muted); font-size: .82rem; }
.opt-body { display: grid; grid-template-columns: 1fr 1fr; gap: 0 12px; margin-top: 12px; }
.opt-body .adm-field { margin-bottom: 10px; }
.calc { margin: 0 0 4px; padding: 10px 12px; border-radius: 14px; background: #eef2ff; color: #3730a3; font-size: .84rem; line-height: 1.45; }
.calc i { margin-right: 4px; }
.warn { color: #b45309; }
.switch { flex: none; width: 46px; height: 26px; border-radius: 999px; border: 0; background: #d4d4d8; position: relative; cursor: pointer; transition: background .2s; }
.switch span { position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; transition: transform .2s; box-shadow: 0 1px 3px rgb(0 0 0 / 20%); }
.switch.on { background: #4F46E5; } .switch.on span { transform: translateX(20px); }
.switch:focus-visible { outline: 2px solid #c7d2fe; outline-offset: 2px; }
@media (max-width: 640px) { .g, .opt-body { grid-template-columns: 1fr; } }
</style>
