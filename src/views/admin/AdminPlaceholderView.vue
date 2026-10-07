<script setup>
defineProps({
  title: { type: String, default: 'Coming soon' },
  blurb: { type: String, default: 'This section is not built yet.' },
})
</script>

<template>
  <section class="adm-card placeholder">
    <h2>{{ title }}</h2>
    <p>{{ blurb }}</p>
    <RouterLink class="adm-btn primary" :to="{ name: 'admin-enrollments' }">Go to Enrollments</RouterLink>
  </section>
</template>

<style scoped>
.placeholder {
  padding: 36px 28px;
  max-width: 520px;
}
.placeholder h2 {
  margin: 0 0 8px;
  font-size: 1.25rem;
  letter-spacing: -0.02em;
}
.placeholder p {
  margin: 0 0 20px;
  color: var(--muted);
  line-height: 1.5;
}
</style>
