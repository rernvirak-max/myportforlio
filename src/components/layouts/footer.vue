<template>
    <footer id="footer" class="footer position-relative light-background">
      <div class="container">
        <h3 class="sitename">{{copyrightOwner}}</h3>
        <p> Please reach out to us for any assistance or information you may need..</p>
        <div class="social-links d-flex justify-content-center">
          <a v-for="(link, index) in socialLinks" :key="index" :href="link.url" target="_blank">
            <i :class="link.icon"></i>
          </a>
        </div>
        <div class="container">
          <div class="copyright">
            <span>Copyright</span> <strong class="px-1 sitename">{{ copyrightOwner }}</strong> <span>All Rights Reserved</span>
          </div>
        </div>
      </div>
    </footer>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const socialLinks = ref([
  { url: 'https://t.me/R_Vireak', icon: 'bi bi-telegram' },
  { url: 'https://www.facebook.com/roeunvireak22/', icon: 'bi bi-facebook' },
  { url: 'https://www.instagram.com/vi__reak______/', icon: 'bi bi-instagram' },
  { url: 'https://www.linkedin.com/in/vireak-roeun-a56173326/', icon: 'bi bi-linkedin' },
  ]);
  
  const copyrightOwner = ref('Vireak Roeun');
  </script>
  
  <style scoped>
  /* Add your styles here */
  </style>