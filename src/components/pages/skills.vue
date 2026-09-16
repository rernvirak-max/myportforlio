<template>
    <!-- Skills Section -->
    <section id="skills" class="skills section">
      <!-- Section Title -->
      <div class="container section-title" data-aos="fade-up">
        <h2>Skills</h2>
        <p>With nearly three years of experience in web development, I have honed a diverse set of skills that encompass both front-end and back-end technologies. My expertise includes:</p>
      </div><!-- End Section Title -->
  
      <div class="container" data-aos="fade-up" data-aos-delay="100">
        <div class="row skills-content skills-animation">
          <div class="col-lg-6">
            <div v-for="(skill, index) in skillsLeft" :key="index" class="progress">
              <span class="skill"><span>{{ skill.name }}</span> <i class="val">{{ skill.value }}</i></span>
              <div class="progress-bar-wrap">
                <div class="progress-bar" role="progressbar" :aria-valuenow="skill.percentage" aria-valuemin="0" aria-valuemax="100"></div>
              </div>
            </div><!-- End Skills Item -->
          </div>
  
          <div class="col-lg-6">
            <div v-for="(skill, index) in skillsRight" :key="index" class="progress">
              <span class="skill"><span>{{ skill.name }}</span> <i class="val">{{ skill.value }}</i></span>
              <div class="progress-bar-wrap">
                <div class="progress-bar" role="progressbar" :aria-valuenow="skill.percentage" aria-valuemin="0" aria-valuemax="100"></div>
              </div>
            </div><!-- End Skills Item -->
          </div>
        </div>
      </div>
    </section><!-- /Skills Section -->
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  
  const skillsLeft = ref([
    { name: 'HTML/CSS/Bootstrap', value: '75%', percentage: 75 },
    { name: 'JavaScript', value: '85%', percentage: 85 },
    { name: 'VueJs', value: '80%', percentage: 80 },
    { name: 'OOP (TypeScript, PHP)', value: '70%', percentage: 70 },
    { name: 'Algorithm, logic', value: '90%', percentage: 90 },
  ]);
  
  const skillsRight = ref([
    { name: 'PHP', value: '80%', percentage: 80 },
    { name: 'Laravel 11', value: '90%', percentage: 90 },
    { name: 'MySql', value: '90%', percentage: 90 },
    { name: 'Agile Methodologies', value: '90%', percentage: 75 },
    { name: 'Creativity/Problem Solving', value: '85%', percentage: 85 },
  ]);
  
  const animateProgressBars = (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const progressBars = entry.target.querySelectorAll('.progress .progress-bar');
        progressBars.forEach(el => {
          el.style.width = el.getAttribute('aria-valuenow') + '%';
        });
        // Stop observing after the animation
        observer.unobserve(entry.target);
      }
    });
  };
  
  let observer;
  
  onMounted(() => {
    observer = new IntersectionObserver(animateProgressBars, {
      threshold: 0.8 // Trigger when 80% of the element is visible
    });
  
    const skillsSection = document.querySelector('.skills-animation');
    if (skillsSection) {
      observer.observe(skillsSection);
    }
  });
  </script>
  