<script setup>
import BrandMark from '@/components/BrandMark.vue'
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer">
    <div class="container footer-inner">
      <router-link class="brand" to="/">
        <BrandMark :size="28" />
        <span class="brand-name">Vireak Roeun</span>
      </router-link>
      <p class="footer-copy">© {{ currentYear }} Vireak Roeun · Phnom Penh, Cambodia</p>
      <router-link class="footer-top" to="/courses">
        <i class="bi bi-mortarboard" aria-hidden="true"></i>
        All courses
      </router-link>
    </div>
  </footer>
</template>
