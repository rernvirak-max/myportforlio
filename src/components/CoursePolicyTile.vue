<script setup>
import { MIN_STUDENTS } from '@/data/courses.js'
defineProps({ compact: { type: Boolean, default: false } })
const steps = [
  { n: 1, title: 'Request a seat', text: 'Pick a course (and a class if one is listed) and send the short form.' },
  { n: 2, title: `We confirm at ${MIN_STUDENTS}+ students`, text: `A class opens once at least ${MIN_STUDENTS} students have enrolled. I’ll keep you posted while it fills.` },
  { n: 3, title: 'Class starts', text: 'I’ll contact you to confirm the schedule and details before the class starts.' },
]
</script>

<template>
  <section class="tile policy-tile" :class="{ 'is-compact': compact }" aria-labelledby="policy-title">
    <div class="policy-head">
      <p class="tile-label"><i class="bi bi-people-fill" aria-hidden="true"></i> How classes open</p>
      <h2 id="policy-title" class="policy-title">Classes open at {{ MIN_STUDENTS }} students</h2>
      <p class="tile-note">Small groups, real feedback. Every class needs a minimum of {{ MIN_STUDENTS }} students before it runs.</p>
    </div>
    <ol class="policy-steps" role="list">
      <li v-for="s in steps" :key="s.n" class="policy-step">
        <span class="policy-num" aria-hidden="true">{{ s.n }}</span>
        <div>
          <h3>{{ s.title }}</h3>
          <p>{{ s.text }}</p>
        </div>
      </li>
    </ol>
  </section>
</template>
