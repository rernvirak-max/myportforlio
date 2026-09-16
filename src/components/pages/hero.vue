<template>
  <section id="hero" class="hero section light-background">
    <img :src="heroImage" alt="Hero Background">

    <div class="container" data-aos="zoom-out">
      <div class="row justify-content-center">
        <div class="col-lg-9">
          <h2>{{ name }}</h2>
          <p>
            I'm <span class="typed" ref="typedElement"></span>
            <span class="typed-cursor typed-cursor--blink" aria-hidden="true"></span>
          </p>
          <div class="social-links">
            <a v-for="(link, index) in socialLinks" :key="index" :href="link.url" target="_blank" rel="noopener noreferrer">
              <i :class="link.icon"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import AOS from 'aos'; // Import AOS
import Typed from 'typed.js'; // Import Typed.js

const name = 'Vireak Roeun';
const heroImage = './assets/img/hero-bg.jpg';

const roles = ref(['Web Designer', 'Web Developer', 'Freelancer', "API Developer"]);
const socialLinks = ref([
  { url: 'https://t.me/R_Vireak', icon: 'bi bi-telegram' },
  { url: 'https://www.facebook.com/roeunvireak22/', icon: 'bi bi-facebook' },
  { url: 'https://www.instagram.com/vi__reak______/', icon: 'bi bi-instagram' },
  { url: 'https://www.linkedin.com/in/vireak-roeun-a56173326/', icon: 'bi bi-linkedin' },
]);

const typedElement = ref(null);

onMounted(() => {
  // Initialize AOS
  AOS.init({
    duration: 600,
    easing: 'ease-in-out',
    once: true,
    mirror: false
  });

  // Initialize Typed.js
  const typed = new Typed(typedElement.value, {
    strings: roles.value,
    loop: true,
    typeSpeed: 100,
    backSpeed: 50,
    backDelay: 2000
  });
});
</script>

<style scoped>
/* Add your component-specific styles here */
</style>