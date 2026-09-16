<template>
    <!-- Stats Section -->
    <section id="stats" class="stats section">
      <div class="container" data-aos="fade-up" data-aos-delay="100">
        <div class="row gy-4">
          <div v-for="(stat, index) in stats" :key="index" class="col-lg-3 col-md-6 d-flex flex-column align-items-center">
            <i :class="stat.icon"></i>
            <div class="stats-item">
              <span ref="pureCounterRefs[index]" class="purecounter" :data-purecounter-start="0" :data-purecounter-end="stat.end" data-purecounter-duration="1"></span>
              <p>{{ stat.label }}</p>
            </div>
          </div><!-- End Stats Item -->
        </div>
      </div>
    </section><!-- /Stats Section -->
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  
  const stats = ref([
    { label: 'Happy Clients', end: 11, icon: 'bi bi-emoji-smile' },
    { label: 'Projects', end: 20, icon: 'bi bi-journal-richtext' },
    { label: 'Hours Of Support', end: 855, icon: 'bi bi-headset' },
    { label: 'Hard Workers', end: 3, icon: 'bi bi-people' },
  ]);
  
  const pureCounterRefs = ref([]);
  
  onMounted(() => {
    // Initialize PureCounter
    if (typeof PureCounter !== 'undefined') {
      new PureCounter();
    }
  });
  </script>
  
  <style scoped>
  /* Add your component-specific styles here */
  </style>