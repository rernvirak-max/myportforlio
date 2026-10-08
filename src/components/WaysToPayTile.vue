<script setup>
// "Ways to pay" bento tile for the next open class. Renders nothing unless Max has turned on
// at least one payment option for that class in the admin (fields may be absent from the API).
import { computed } from 'vue'
import { formatCohortDates, minStudentsFor } from '@/data/courses.js'
import { fmtShortDate, formatMoney, paymentOptions } from '@/data/paymentOptions.js'

const props = defineProps({ course: { type: Object, required: true }, cohort: { type: Object, default: null } })
const emit = defineEmits(['enroll'])

const o = computed(() => (props.cohort ? paymentOptions(props.cohort) : null))
const m = (v) => formatMoney(v, o.value?.currency)
const min = computed(() => minStudentsFor(props.course, props.cohort))

const earlyNote = computed(() => {
  const eb = o.value?.earlyBird
  if (!eb) return ''
  const parts = []
  if (eb.until) parts.push(`until ${fmtShortDate(eb.until)}`)
  if (eb.seatsLeft != null) parts.push(`${eb.seatsLeft} early-bird seat${eb.seatsLeft === 1 ? '' : 's'} left`)
  return parts.length ? `${parts.join(' · ')}.` : ''
})

const options = computed(() => {
  const x = o.value
  if (!x?.any) return []
  const list = []
  if (x.earlyBird) {
    list.push({ key: 'early', icon: 'bi-alarm', title: 'Early-bird price', value: m(x.earlyBird.price), was: m(x.earlyBird.price + x.earlyBird.saving),
      text: `Save ${m(x.earlyBird.saving)} when you book early${earlyNote.value ? ' — ' + earlyNote.value : '.'}` })
  } else if (x.price != null) {
    list.push({ key: 'full', icon: 'bi-credit-card', title: 'Pay in full', value: m(x.price), text: 'One payment for the whole course.' })
  }
  if (x.installments) {
    list.push({ key: 'installments', icon: 'bi-calendar2-week', title: 'Pay monthly', value: `${m(x.installments.amount)}/month`,
      text: `${x.installments.count} monthly payments of ${m(x.installments.amount)} (${m(x.installments.total)} in total).` })
  }
  if (x.deposit) {
    list.push({ key: 'deposit', icon: 'bi-bookmark-check', title: 'Hold your seat', value: `${m(x.deposit)} deposit`,
      text: `Hold your seat with a ${m(x.deposit)} deposit. Pay the rest only when the class reaches ${min.value} students. Full refund if the class doesn’t open.` })
  }
  if (x.referral) {
    list.push({ key: 'referral', icon: 'bi-people', title: 'Bring a friend', value: `Save ${m(x.referral)} each`,
      text: `Bring a friend: you both save ${m(x.referral)}. Just add their name when you request a seat.` })
  }
  return list
})
</script>

<template>
  <section v-if="options.length" class="tile pay-tile" aria-labelledby="pay-title">
    <div class="pay-tile-head">
      <p class="tile-label"><i class="bi bi-wallet2" aria-hidden="true"></i> Ways to pay</p>
      <h2 id="pay-title" class="panel-title">Pay the way that suits you</h2>
      <p class="tile-note">
        For <strong>{{ cohort.title }}</strong> · {{ formatCohortDates(cohort) }}.
        Mention the option you’d like in your request and I’ll confirm the details with you.
      </p>
      <button class="btn btn-accent" type="button" @click="emit('enroll', cohort)">
        Request a seat <i class="bi bi-arrow-right" aria-hidden="true"></i>
      </button>
    </div>
    <ul class="pay-options" role="list">
      <li v-for="opt in options" :key="opt.key" class="pay-option" :class="`is-${opt.key}`">
        <span class="pay-icon" aria-hidden="true"><i class="bi" :class="opt.icon"></i></span>
        <div class="pay-body">
          <h3>{{ opt.title }}</h3>
          <p class="pay-value">{{ opt.value }} <s v-if="opt.was" class="price-was"><span class="visually-hidden">Regular price </span>{{ opt.was }}</s></p>
          <p class="pay-text">{{ opt.text }}</p>
        </div>
      </li>
    </ul>
  </section>
</template>
