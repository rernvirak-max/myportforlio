<script setup>
import BrandMark from '@/components/BrandMark.vue'
defineProps({ back: { type: Object, default: () => ({ to: '/', label: 'Home' }) } })
</script>

<template>
  <header class="site-header is-scrolled">
    <div class="container nav-bar">
      <router-link class="brand" to="/" aria-label="Vireak Roeun, back to home">
        <BrandMark :size="32" />
        <span class="brand-name">Vireak Roeun</span>
      </router-link>
      <nav class="course-nav" aria-label="Courses">
        <router-link class="btn btn-ghost btn-sm" :to="back.to">
          <i class="bi bi-arrow-left" aria-hidden="true"></i>
          {{ back.label }}
        </router-link>
        <slot />
      </nav>
    </div>
  </header>
</template>
