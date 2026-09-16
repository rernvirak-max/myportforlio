<template>
    <!-- Resume Section -->
    <section id="resume" class="resume section">
      <!-- Section Title -->
      <div class="container section-title" data-aos="fade-up">
        <h2>Resume</h2>
        <p>Passionate web developer with expertise in creating responsive and user-friendly websites. Proficient in HTML, CSS, JavaScript, and modern frameworks. Committed to delivering high-quality code and enhancing user experience through innovative solutions.</p>
      </div><!-- End Section Title -->
  
      <div class="container">
        <div class="row">
          <div class="col-lg-6" data-aos="fade-up" data-aos-delay="100">
            <h3 class="resume-title">Summary</h3>
            <div class="resume-item pb-0">
              <h4>{{ personalInfo.name }}</h4>
              <p><em>{{ personalInfo.summary }}</em></p>
              <ul>
                <li>{{ personalInfo.address }}</li>
                <li>{{ personalInfo.phone }}</li>
                <li>{{ personalInfo.email }}</li>
              </ul>
            </div><!-- End Resume Item -->
  
            <h3 class="resume-title">Education</h3>
            <div v-for="(edu, index) in education" :key="index" class="resume-item">
              <h4>{{ edu.degree }}</h4>
              <h5>{{ edu.years }}</h5>
              <p><em>{{ edu.institution }}</em></p>
              <p>{{ edu.description }}</p>
            </div><!-- End Resume Item -->
          </div>
  
          <div class="col-lg-6" data-aos="fade-up" data-aos-delay="200">
            <h3 class="resume-title">Professional Experience</h3>
            <div v-for="(exp, index) in experience" :key="index" class="resume-item">
              <h4>{{ exp.title }}</h4>
              <h5>{{ exp.years }}</h5>
              <p><em>{{ exp.company }}</em></p>
              <ul>
                <li v-for="(task, taskIndex) in exp.tasks" :key="taskIndex">{{ task }}</li>
              </ul>
            </div><!-- End Resume Item -->
          </div>
        </div>
      </div>
    </section><!-- /Resume Section -->
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const personalInfo = ref({
    name: 'Vireak Roeun',
    summary: 'With nearly three years of web development experience, I possess a diverse skill set in both front-end and back-end technologies, including HTML, CSS, JavaScript, Vue.js, PHP, Laravel, MySQL, and Agile methodologies, complemented by strong problem-solving abilities and a creative approach to challenges.',
    address: 'Street 1, Sangkat Khan Chbar Ampeou, 8561',
    phone: '+855 887199572',
    email: 'vireakroeun0@gmail.com'
  });
  
  const education = ref([
    {
      degree: 'Associate Degree Computer Science',
      years: '2021 - 2023',
      institution: 'passerelles numériques cambodia',
      description: 'Passerelles Numériques in Cambodia (PNC) offers a 2-year full time training in IT with a major in Software Development.'
    }
    // {
    //   degree: 'Bachelor Computer Science',
    //   years: '2023 - 2014',
    //   institution: 'Rochester Institute of Technology, Rochester, NY',
    //   description: 'Quia nobis sequi est occaecati aut. Repudiandae et iusto quae reiciendis et quis Eius vel ratione eius unde vitae rerum voluptates asperiores voluptatem Earum molestiae consequatur neque etlon sader mart dila'
    // }
  ]);
  
  const experience = ref([
    {
      title: 'Web Developer & Teacher',
      years: '2024 - 2025',
      company: '42 St 606, Phnom Penh',
      tasks: [
        'Conduct project planning and develop robust APIs (backend) that align with user requirements and specifications.',
        'Analyze database structures and optimize backend API development to enhance data retrieval efficiency and ensure robust system performance.',
        'Educate and mentor students in web development technologies and best practices.',
        'Create engaging lesson plans and instructional materials for effective learning.'
      ]
    },
    {
      title: 'Laravel Developer',
      years: '2023 - 2024',
      company: '1159 NR2, Phnom Penh',
      tasks: [
        'Laravel Developer: Specialize in building and maintaining web applications using the Laravel framework, focusing on efficient backend development and seamless database integration.',
        'Full Stack Developer: Proficient in both frontend and backend development, capable of designing, implementing, and optimizing complete web solutions that deliver a cohesive user experience.',
      ]
    }
  ]);
  </script>
  