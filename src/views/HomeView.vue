<template>
  <div class="portfolio-page">
    <header class="site-header" :class="{ 'site-header-scrolled': isScrolled }">
      <div class="container nav-shell">
        <a class="brand" href="#hero" @click="activeSection = 'hero'">
          <BrandMark :size="40" />
          <span class="brand-copy">
            <strong>Vireak Roeun</strong>
            <small>Full-Stack Developer & DevOps Engineer</small>
          </span>
        </a>

        <button
          class="nav-toggle"
          type="button"
          :aria-expanded="isMenuOpen ? 'true' : 'false'"
          aria-controls="primary-nav"
          aria-label="Toggle navigation"
          @click="toggleMenu"
        >
          <i :class="isMenuOpen ? 'bi bi-x-lg' : 'bi bi-list'"></i>
        </button>

        <nav id="primary-nav" class="top-nav" :class="{ 'is-open': isMenuOpen }" aria-label="Primary">
          <div class="nav-links">
            <a
              v-for="item in navItems"
              :key="item.href"
              :href="item.href"
              :class="{ active: activeSection === item.id }"
              @click="handleNavClick(item.id)"
            >
              {{ item.label }}
            </a>
          </div>
          <a class="nav-cta" href="/Vireak-Roeun-CV.pdf" download @click="closeMenu">
            <i class="bi bi-download"></i>
            Download CV
          </a>
        </nav>
      </div>
    </header>

    <main>
      <section id="hero" class="section hero-section">
        <div class="bg-orb orb-1"></div>
        <div class="bg-orb orb-2"></div>
        <div class="container hero-grid">
          <div class="hero-copy reveal">
            <div class="hero-kicker">
              <span class="status-pill">
                <span class="status-dot" aria-hidden="true"></span>
                Open to freelance
              </span>
              <p class="eyebrow">Senior DevOps Officer & Full-Stack Developer</p>
            </div>
            <h1>Vireak Roeun</h1>
            <p class="hero-tagline">
              Full-Stack Developer & DevOps Engineer building scalable systems with Laravel, Vue, and AWS.
            </p>
            <div class="hero-actions">
              <a class="btn btn-solid btn-lg" href="#projects" @click="handleNavClick('projects')">
                View work
                <i class="bi bi-arrow-right" aria-hidden="true"></i>
              </a>
              <a class="btn btn-outline btn-lg" href="/Vireak-Roeun-CV.pdf" download>
                <i class="bi bi-download" aria-hidden="true"></i>
                Download CV
              </a>
            </div>
            <ul class="hero-social" aria-label="Social links">
              <li v-for="item in heroSocials" :key="item.label">
                <a
                  class="icon-btn"
                  :href="item.href"
                  :aria-label="item.label"
                  :title="item.label"
                  v-bind="item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {}"
                >
                  <i :class="item.icon" aria-hidden="true"></i>
                </a>
              </li>
            </ul>
          </div>
          <div class="hero-profile reveal" :style="revealDelay(1)">
            <picture>
              <source :srcset="profileWebp" type="image/webp" />
              <img
                :src="profileJpg"
                alt="Vireak Roeun profile photo"
                width="520"
                height="520"
                decoding="async"
                fetchpriority="high"
              />
            </picture>
            <div class="profile-meta">
              <p>Phnom Penh, Cambodia</p>
              <span>Institute of Banking and Finance</span>
            </div>
          </div>
        </div>
      </section>

      <section id="about" class="section content-section">
        <div class="container">
          <div class="section-head reveal">
            <p class="eyebrow">About</p>
            <h2>Production-minded engineering across app and infrastructure</h2>
          </div>
          <div class="about-grid">
            <p class="lead reveal">
              I am a Full-Stack Developer and DevOps Engineer based in Cambodia, currently working at the Institute
              of Banking and Finance. I build and maintain business-critical systems using Laravel, Vue.js, Docker,
              and AWS, with a strong focus on reliability, deployment automation, and operational clarity.
            </p>
            <ul class="highlight-list reveal">
              <li><i class="bi bi-check2-circle"></i> Backend API design and integration for internal platforms</li>
              <li><i class="bi bi-check2-circle"></i> CI/CD implementation with GitHub Actions for safer releases</li>
              <li><i class="bi bi-check2-circle"></i> Containerized workloads and server management on Ubuntu/VPS</li>
              <li><i class="bi bi-check2-circle"></i> Database architecture and data validation with MySQL</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="experience" class="section content-section">
        <div class="container">
          <div class="section-head reveal">
            <p class="eyebrow">Experience</p>
            <h2>Career timeline</h2>
          </div>
          <ol class="timeline">
            <li
              v-for="(job, index) in experiences"
              :key="job.role + job.company"
              class="timeline-item reveal"
              :class="{ 'is-current': job.period.includes('Present') }"
              :style="revealDelay(index)"
            >
              <span class="timeline-dot" aria-hidden="true"></span>
              <span class="timeline-badge">
                <i class="bi bi-calendar3" aria-hidden="true"></i>
                {{ job.period }}
              </span>
              <article class="timeline-card">
                <h3>{{ job.role }}</h3>
                <p class="company">{{ job.company }}</p>
                <ul>
                  <li v-for="item in job.responsibilities" :key="item">{{ item }}</li>
                </ul>
              </article>
            </li>
          </ol>
        </div>
      </section>

      <section id="skills" class="section content-section">
        <div class="container">
          <div class="section-head reveal">
            <p class="eyebrow">Skills</p>
            <h2>Full-stack and DevOps capabilities</h2>
          </div>
          <div class="skills-panel reveal">
            <div class="skill-group" v-for="group in skillGroups" :key="group.title">
              <h3 class="skill-group-title">
                <i :class="group.icon" aria-hidden="true"></i>
                {{ group.title }}
              </h3>
              <ul class="chip-wrap chip-wrap-dense" role="list">
                <li class="chip" v-for="item in group.items" :key="item">{{ item }}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="projects" class="section content-section">
        <div class="container">
          <div class="section-head reveal">
            <p class="eyebrow">Projects</p>
            <h2>Selected work and real systems</h2>
          </div>
          <div class="projects-grid">
            <article
              class="project-card reveal"
              v-for="(project, index) in projects"
              :key="project.title"
              :style="revealDelay(index)"
            >
              <div class="project-card-head" aria-hidden="true">
                <span class="project-icon"><i :class="project.icon"></i></span>
                <span class="project-index">{{ String(index + 1).padStart(2, '0') }}</span>
              </div>
              <div class="project-card-body">
                <h3>{{ project.title }}</h3>
                <p>{{ project.description }}</p>
                <div class="chip-wrap">
                  <span class="chip" v-for="tech in project.tech" :key="tech">{{ tech }}</span>
                </div>
                <p class="project-soon">
                  <i class="bi bi-hourglass-split" aria-hidden="true"></i>
                  Case study soon
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="devops" class="section content-section">
        <div class="container">
          <div class="section-head reveal">
            <p class="eyebrow">DevOps</p>
            <h2>Infrastructure and deployment workflow</h2>
          </div>
          <div class="devops-grid">
            <article
              class="devops-card reveal"
              v-for="(item, index) in devopsCards"
              :key="item.title"
              :style="revealDelay(index)"
            >
              <i :class="item.icon"></i>
              <h3>{{ item.title }}</h3>
              <p>{{ item.text }}</p>
            </article>
          </div>
          <div class="arch-diagram reveal" aria-label="Deployment architecture flow">
            <span>Vue Frontend</span>
            <i class="bi bi-arrow-right"></i>
            <span>Laravel API</span>
            <i class="bi bi-arrow-right"></i>
            <span>Docker Container</span>
            <i class="bi bi-arrow-right"></i>
            <span>AWS / VPS</span>
            <i class="bi bi-arrow-right"></i>
            <span>GitHub Actions CI/CD</span>
          </div>
        </div>
      </section>

      <section id="education" class="section content-section">
        <div class="container">
          <div class="section-head reveal">
            <p class="eyebrow">Education</p>
            <h2>Academic background</h2>
          </div>
          <div class="education-grid">
            <article
              class="edu-card reveal"
              v-for="(item, index) in education"
              :key="item.school"
              :style="revealDelay(index)"
            >
              <i class="bi bi-mortarboard-fill"></i>
              <h3>{{ item.degree }}</h3>
              <p>{{ item.school }}</p>
              <span>{{ item.period }}</span>
            </article>
          </div>
        </div>
      </section>

      <section id="contact" class="section content-section">
        <div class="container">
          <div class="section-head reveal">
            <p class="eyebrow">Contact</p>
            <h2>Let’s build reliable products together</h2>
          </div>
          <div class="contact-grid">
            <div
              class="contact-card reveal"
              v-for="(item, index) in contacts"
              :key="item.label"
              :style="revealDelay(index)"
            >
              <i :class="item.icon"></i>
              <h3>{{ item.label }}</h3>
              <a :href="item.href" target="_blank" rel="noopener noreferrer">{{ item.value }}</a>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer id="site-footer" class="site-footer">
      <div class="container footer-inner">
        <a class="footer-brand" href="#hero">
          <BrandMark :size="36" />
          <strong>Vireak Roeun</strong>
        </a>
        <p class="footer-copy">© {{ currentYear }} Vireak Roeun · Phnom Penh, Cambodia</p>
      </div>
    </footer>

    <div
      class="mobile-cta"
      :class="{ 'is-hidden': hideMobileCta }"
      :inert="hideMobileCta"
      :aria-hidden="hideMobileCta ? 'true' : 'false'"
    >
      <a class="btn btn-solid" href="/Vireak-Roeun-CV.pdf" download>
        <i class="bi bi-download" aria-hidden="true"></i>
        Download CV
      </a>
      <a class="btn btn-outline" href="#contact" @click="handleNavClick('contact')">
        <i class="bi bi-chat-dots" aria-hidden="true"></i>
        Contact
      </a>
    </div>

    <button
      class="scroll-top"
      :class="{ 'scroll-top-lifted': !hideMobileCta }"
      type="button"
      aria-label="Scroll to top"
      @click="scrollToTop"
      v-show="showScrollTop"
    >
      <i class="bi bi-arrow-up" aria-hidden="true"></i>
    </button>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import BrandMark from '@/components/BrandMark.vue';
import profileWebp from '@/assets/img/profile-520.webp';
import profileJpg from '@/assets/img/profile-520.jpg';

const navItems = [
  { id: 'hero', label: 'Home', href: '#hero' },
  { id: 'about', label: 'About', href: '#about' },
  { id: 'experience', label: 'Experience', href: '#experience' },
  { id: 'skills', label: 'Skills', href: '#skills' },
  { id: 'projects', label: 'Projects', href: '#projects' },
  { id: 'devops', label: 'DevOps', href: '#devops' },
  { id: 'education', label: 'Education', href: '#education' },
  { id: 'contact', label: 'Contact', href: '#contact' }
];

const socialLinks = {
  github: 'https://github.com/rernvirak-max',
  telegram: 'https://t.me/R_Vireak',
  linkedin: 'https://www.linkedin.com/in/vireak-roeun-6751ab29a/',
  email: 'mailto:roeunvireak0@gmail.com'
};

const heroSocials = [
  { label: 'GitHub', href: socialLinks.github, icon: 'bi bi-github', external: true },
  { label: 'Telegram', href: socialLinks.telegram, icon: 'bi bi-telegram', external: true },
  { label: 'LinkedIn', href: socialLinks.linkedin, icon: 'bi bi-linkedin', external: true },
  { label: 'Email', href: socialLinks.email, icon: 'bi bi-envelope-fill', external: false }
];

const skillGroups = [
  { title: 'Backend', icon: 'bi bi-hdd-stack', items: ['PHP', 'Laravel', 'RESTful APIs', 'Node.js'] },
  { title: 'Frontend', icon: 'bi bi-window-stack', items: ['Vue.js', 'Quasar', 'HTML', 'CSS', 'JavaScript'] },
  { title: 'Database', icon: 'bi bi-database', items: ['MySQL', 'Database Architecture', 'Data Validation'] },
  {
    title: 'DevOps',
    icon: 'bi bi-cloud-check',
    items: ['Docker', 'CI/CD Pipelines', 'GitHub Actions', 'AWS', 'VPS Deployment', 'Ubuntu Server']
  }
];

const projects = [
  {
    title: 'IBF Dashboard Platform',
    icon: 'bi bi-speedometer2',
    description:
      'Designed and maintained backend API features for the Institute of Banking and Finance dashboard, then integrated those APIs into a Vue + Quasar frontend.',
    tech: ['Laravel', 'REST API', 'Vue.js', 'Quasar', 'MySQL']
  },
  {
    title: 'Restaurant Display Website',
    icon: 'bi bi-shop',
    description:
      'Built a production-ready website for restaurant presentation and business visibility with backend-driven content management.',
    tech: ['Laravel', 'Vue.js', 'MySQL']
  },
  {
    title: 'Farm Management System',
    icon: 'bi bi-flower1',
    description:
      'Developed system modules for farm operations, data tracking, and reporting workflows with reliable backend processing.',
    tech: ['Laravel', 'MySQL', 'JavaScript']
  },
  {
    title: 'Team Management System',
    icon: 'bi bi-people',
    description:
      'Implemented team workflow features, role-based operations, and structured data management for internal coordination.',
    tech: ['Laravel', 'REST API', 'MySQL']
  },
  {
    title: 'AWS Hosting & CI/CD Services',
    icon: 'bi bi-cloud-check',
    description:
      'Provided deployment and hosting services for local company projects using AWS infrastructure, Dockerized services, and automated CI/CD pipelines.',
    tech: ['AWS', 'Docker', 'GitHub Actions', 'Ubuntu Server', 'VPS']
  }
];

const devopsCards = [
  {
    title: 'CI/CD Pipelines',
    icon: 'bi bi-git',
    text: 'Implemented automated build, test, and deployment flows using GitHub Actions.'
  },
  {
    title: 'Docker Containerization',
    icon: 'bi bi-box-seam',
    text: 'Containerized applications to ensure consistent environments from development to production.'
  },
  {
    title: 'Cloud Deployment',
    icon: 'bi bi-cloud-arrow-up',
    text: 'Deployed and operated systems on AWS and VPS infrastructure for production workloads.'
  },
  {
    title: 'Server Management',
    icon: 'bi bi-terminal',
    text: 'Configured Ubuntu servers, hardened runtime setup, and optimized service reliability.'
  }
];

const experiences = [
  {
    role: 'Senior DevOps Officer',
    company: 'Institute of Banking and Finance',
    period: '2025 - Present',
    responsibilities: [
      'Lead backend development using Laravel to build scalable systems.',
      'Design and maintain RESTful APIs and integration workflows.',
      'Integrate API-driven features into Vue and Quasar frontend applications.',
      'Deploy applications with Docker on AWS and VPS environments.',
      'Build CI/CD pipelines using GitHub Actions.',
      'Troubleshoot production systems and optimize performance and security.'
    ]
  },
  {
    role: 'Web Developer & Programming Instructor',
    company: 'ANT Training Center',
    period: '2024 - 2025',
    responsibilities: [
      'Developed full-stack web applications for practical learning use cases.',
      'Taught PHP, Laravel, MySQL, and OOP programming.',
      'Mentored junior developers and supported project delivery.'
    ]
  },
  {
    role: 'Laravel Developer',
    company: 'Vichea IT Solutions',
    period: '2023 - 2024',
    responsibilities: [
      'Developed backend features for a Coffee Shop Management System.',
      'Built APIs using Laravel and MySQL for frontend integration.',
      'Participated in bug fixing and internal code reviews.'
    ]
  }
];

const education = [
  {
    degree: 'Computer Science',
    school: 'Passerelles Numeriques Cambodia',
    period: '2021 - 2023'
  },
  {
    degree: 'High School Diploma',
    school: 'Chbar Ampov High School',
    period: '2016 - 2021'
  }
];

const contacts = [
  {
    label: 'Email',
    value: 'roeunvireak0@gmail.com',
    href: 'mailto:roeunvireak0@gmail.com',
    icon: 'bi bi-envelope-fill'
  },
  {
    label: 'Telegram',
    value: 't.me/R_Vireak',
    href: 'https://t.me/R_Vireak',
    icon: 'bi bi-telegram'
  },
  {
    label: 'LinkedIn',
    value: 'linkedin.com/in/vireak-roeun-6751ab29a',
    href: 'https://www.linkedin.com/in/vireak-roeun-6751ab29a/',
    icon: 'bi bi-linkedin'
  },
  {
    label: 'GitHub',
    value: 'github.com/rernvirak-max',
    href: 'https://github.com/rernvirak-max',
    icon: 'bi bi-github'
  },
  {
    label: 'Location',
    value: 'Phnom Penh, Cambodia',
    href: 'https://maps.google.com/?q=Phnom+Penh+Cambodia',
    icon: 'bi bi-geo-alt-fill'
  }
];

const currentYear = new Date().getFullYear();
const showScrollTop = ref(false);
const activeSection = ref('hero');
const isMenuOpen = ref(false);
const isScrolled = ref(false);
const isContactInView = ref(false);
const hideMobileCta = computed(() => isMenuOpen.value || isContactInView.value);
let revealObserver;
let contactObserver;

// Staggered reveal: each card in a grid starts a little later (capped so long lists don't drag).
const revealDelay = (index) => ({ '--reveal-delay': `${Math.min(index, 4) * 90}ms` });

const handleScroll = () => {
  showScrollTop.value = window.scrollY > 500;
  isScrolled.value = window.scrollY > 24;
  updateActiveSection();
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const updateActiveSection = () => {
  const scrollPosition = window.scrollY + 140;
  const sections = navItems.map((item) => item.id);

  for (const id of sections) {
    const section = document.getElementById(id);
    if (!section) {
      continue;
    }

    const sectionTop = section.offsetTop;
    const sectionBottom = sectionTop + section.offsetHeight;

    if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
      activeSection.value = id;
      return;
    }
  }
};

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

const handleNavClick = (id) => {
  activeSection.value = id;
  closeMenu();
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  updateActiveSection();

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  // Hide the mobile CV/Contact bar once the contact section (or footer) is on screen.
  const visibleTargets = new Set();
  contactObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          visibleTargets.add(entry.target);
        } else {
          visibleTargets.delete(entry.target);
        }
      });
      isContactInView.value = visibleTargets.size > 0;
    },
    { rootMargin: '0px 0px -20% 0px' }
  );

  ['contact', 'site-footer'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      contactObserver.observe(el);
    }
  });
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
  if (revealObserver) {
    revealObserver.disconnect();
  }
  if (contactObserver) {
    contactObserver.disconnect();
  }
});
</script>
