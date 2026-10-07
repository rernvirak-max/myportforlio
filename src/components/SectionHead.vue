<script setup>
// Shared section heading: small numbered eyebrow + large title (+ optional lead slot).
defineProps({
  index: { type: String, required: true },
  eyebrow: { type: String, required: true },
  title: { type: String, required: true },
  titleId: { type: String, default: undefined }
});
</script>

<template>
  <header class="section-head reveal">
    <p class="eyebrow">
      <span class="eyebrow-index">{{ index }}</span>
      {{ eyebrow }}
    </p>
    <h2 :id="titleId">{{ title }}</h2>
    <slot />
  </header>
</template>
