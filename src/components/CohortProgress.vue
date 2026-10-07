<script setup>
import { computed } from 'vue'
import { cohortProgress } from '@/data/courses.js'
const props = defineProps({ course: { type: Object, required: true }, cohort: { type: Object, required: true } })
const p = computed(() => cohortProgress(props.course, props.cohort))
</script>

<template>
  <div class="cohort-progress" :class="{ 'is-confirmed': p.confirmed }">
    <div class="cohort-progress-row">
      <span class="cohort-progress-label">{{ p.label }}</span>
      <span v-if="p.hasCounts && p.seatsLeft != null && !p.confirmed" class="cohort-progress-seats">{{ p.seatsLeft }} seats left</span>
    </div>
    <div
      v-if="p.hasCounts"
      class="progress-track"
      role="progressbar"
      :aria-valuenow="p.confirmed ? p.enrolled : p.enrolled"
      aria-valuemin="0"
      :aria-valuemax="p.confirmed ? p.seats || p.enrolled : p.min"
      :aria-label="p.label"
    >
      <span class="progress-fill" :style="{ width: `${Math.max(p.pct, 4)}%` }"></span>
    </div>
  </div>
</template>
