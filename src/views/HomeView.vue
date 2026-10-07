<template>
  <div class="page">
    <a class="skip-link" href="#main">Skip to content</a>

    <header class="site-header" :class="{ 'is-scrolled': isScrolled, 'menu-open': isMenuOpen }">
      <div class="container nav-bar">
        <a class="brand" href="#hero" aria-label="Vireak Roeun, back to top" @click="handleNavClick('hero')">
          <BrandMark :size="32" />
          <span class="brand-name">Vireak Roeun</span>
        </a>

        <nav class="nav-desktop" aria-label="Primary">
          <a
            v-for="item in menuItems"
            :key="item.href"
            :href="item.href"
            :class="{ active: activeSection === item.id }"
            :aria-current="activeSection === item.id ? 'true' : undefined"
            @click="handleNavClick(item.id)"
          >
            {{ item.label }}
          </a>
        </nav>

        <div class="nav-actions">
          <a class="btn btn-dark btn-sm nav-cv" href="/Vireak-Roeun-CV.pdf" download>
            <i class="bi bi-download" aria-hidden="true"></i>
            Download CV
          </a>
          <button
            class="nav-toggle"
            type="button"
            :aria-expanded="isMenuOpen ? 'true' : 'false'"
            aria-controls="mobile-menu"
            :aria-label="isMenuOpen ? 'Close menu' : 'Open menu'"
            @click="toggleMenu"
          >
            <i :class="isMenuOpen ? 'bi bi-x-lg' : 'bi bi-list'" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      <div id="mobile-menu" class="mobile-menu" :class="{ 'is-open': isMenuOpen }" :inert="!isMenuOpen">
        <nav class="container" aria-label="Mobile">
          <a
            v-for="item in menuItems"
            :key="item.href"
            :href="item.href"
            :class="{ active: activeSection === item.id }"
            @click="handleNavClick(item.id)"
          >
            {{ item.label }}
            <i class="bi bi-arrow-right" aria-hidden="true"></i>
          </a>
          <a class="btn btn-dark btn-block" href="/Vireak-Roeun-CV.pdf" download @click="closeMenu">
            <i class="bi bi-download" aria-hidden="true"></i>
            Download CV
          </a>
        </nav>
      </div>
    </header>
    <div class="menu-scrim" :class="{ 'is-open': isMenuOpen }" aria-hidden="true" @click="closeMenu"></div>

    <main id="main">
      <!-- Hero: bento grid -->
      <section id="hero" class="hero" aria-labelledby="hero-title">
        <div class="container bento">
          <div class="tile tile-intro reveal">
            <p class="eyebrow eyebrow-accent">Senior DevOps Officer & Full-Stack Developer · Team Lead Digital &amp; Information (IBF)</p>
            <h1 id="hero-title">Vireak Roeun</h1>
            <p class="hero-tagline">
              Full-Stack Developer & DevOps Engineer shipping Laravel, Vue, and Quasar systems with Docker, Coolify, and AWS.
            </p>
            <div class="hero-actions">
              <a class="btn btn-accent btn-lg" href="#projects" @click="handleNavClick('projects')">
                View work
                <i class="bi bi-arrow-right" aria-hidden="true"></i>
              </a>
              <a class="btn btn-ghost btn-lg" href="/Vireak-Roeun-CV.pdf" download>
                <i class="bi bi-download" aria-hidden="true"></i>
                Download CV
              </a>
            </div>
          </div>

          <div class="tile tile-photo reveal" :style="revealDelay(1)">
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
          </div>

          <div class="tile tile-status reveal" :style="revealDelay(2)">
            <p class="status-line">
              <span class="status-dot" aria-hidden="true"></span>
              Open to freelance
            </p>
            <p class="tile-note">
              Currently Senior DevOps Officer at <strong>Institute of Banking and Finance</strong>
            </p>
          </div>

          <div class="tile tile-stack reveal" :style="revealDelay(2)">
            <p class="tile-label">Core stack</p>
            <ul class="stack-list" role="list">
              <li v-for="item in heroStack" :key="item.label">
                <span class="stack-icon"><i :class="item.icon" aria-hidden="true"></i></span>
                {{ item.label }}
              </li>
            </ul>
          </div>

          <a
            class="tile tile-location reveal"
            :href="locationLink"
            target="_blank"
            rel="noopener noreferrer"
            :style="revealDelay(3)"
          >
            <p class="tile-label"><i class="bi bi-geo-alt-fill" aria-hidden="true"></i> Location</p>
            <p class="location-city">Phnom Penh</p>
            <p class="tile-note">Cambodia</p>
            <span class="tile-corner" aria-hidden="true"><i class="bi bi-arrow-up-right"></i></span>
          </a>

          <div class="tile tile-socials reveal" :style="revealDelay(4)">
            <p class="tile-label">Find me</p>
            <ul class="social-grid" role="list">
              <li v-for="item in heroSocials" :key="item.label">
                <a
                  :href="item.href"
                  v-bind="item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {}"
                >
                  <i :class="item.icon" aria-hidden="true"></i>
                  <span>{{ item.label }}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- About -->
      <section id="about" class="section" aria-labelledby="about-title">
        <div class="container about-layout">
          <div>
            <SectionHead
              index="01"
              eyebrow="About"
              title="Production-minded engineering across app, platform, and infrastructure"
              title-id="about-title"
            />
            <p class="lead reveal">
              I am a Full-Stack Developer and DevOps Engineer based in Cambodia, currently Senior DevOps Officer and
              Team Lead Digital &amp; Information at the Institute of Banking and Finance. I build and operate
              business-critical systems with Laravel, Vue.js, Quasar, Docker, Coolify, and AWS — focused on reliable
              releases, clear operations, and careful shipping.
            </p>
          </div>
          <ul class="highlight-list tile reveal" role="list" :style="revealDelay(1)">
            <li v-for="item in highlights" :key="item.text">
              <span class="highlight-icon"><i :class="item.icon" aria-hidden="true"></i></span>
              {{ item.text }}
            </li>
          </ul>
        </div>
      </section>

      <!-- Experience -->
      <section id="experience" class="section" aria-labelledby="experience-title">
        <div class="container">
          <SectionHead index="02" eyebrow="Experience" title="Career timeline" title-id="experience-title" />
          <ol class="exp-list" role="list">
            <li
              v-for="(job, index) in experiences"
              :key="job.role + job.company"
              class="exp-item reveal"
              :style="revealDelay(index)"
            >
              <div class="exp-meta">
                <span class="exp-period">{{ job.period }}</span>
                <span v-if="job.period.includes('Present')" class="badge badge-live">
                  <span class="status-dot" aria-hidden="true"></span>
                  Current
                </span>
              </div>
              <div class="exp-body">
                <h3>{{ job.role }}</h3>
                <p class="exp-company">{{ job.company }}</p>
                <ul class="exp-points">
                  <li v-for="item in job.responsibilities" :key="item">{{ item }}</li>
                </ul>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <!-- Skills -->
      <section id="skills" class="section" aria-labelledby="skills-title">
        <div class="container">
          <SectionHead index="03" eyebrow="Skills" title="Full-stack, platform, and DevOps capabilities" title-id="skills-title" />
          <div class="skills-grid">
            <article
              v-for="(group, index) in skillGroups"
              :key="group.title"
              class="tile skill-tile reveal"
              :class="{ 'skill-tile-accent': group.title.startsWith('DevOps') }"
              :style="revealDelay(index)"
            >
              <div class="skill-head">
                <span class="icon-badge"><i :class="group.icon" aria-hidden="true"></i></span>
                <h3>{{ group.title }}</h3>
              </div>
              <ul class="chips" role="list">
                <li class="chip" v-for="item in group.items" :key="item">{{ item }}</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <!-- Projects -->
      <section id="projects" class="section" aria-labelledby="projects-title">
        <div class="container">
          <SectionHead index="04" eyebrow="Projects" title="Selected work and real systems" title-id="projects-title" />
          <div class="projects-grid">
            <article
              v-for="(project, index) in projects"
              :key="project.title"
              class="tile project-card reveal"
              :class="{ 'project-featured': index === 0 }"
              :style="revealDelay(index)"
            >
              <i v-if="index === 0" class="bi bi-speedometer2 project-watermark" aria-hidden="true"></i>
              <div class="project-top">
                <span class="icon-badge" :class="{ 'icon-badge-lg': index === 0 }">
                  <i :class="project.icon" aria-hidden="true"></i>
                </span>
                <span v-if="index === 0" class="badge badge-accent">Featured</span>
                <span v-else class="project-index" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
              </div>
              <h3>{{ project.title }}</h3>
              <p class="project-desc">{{ project.description }}</p>
              <ul class="chips" role="list" :aria-label="`${project.title} tech stack`">
                <li class="chip" v-for="tech in project.tech" :key="tech">{{ tech }}</li>
              </ul>
              <p class="project-soon">
                <i class="bi bi-hourglass-split" aria-hidden="true"></i>
                Case study soon
              </p>
            </article>
          </div>
        </div>
      </section>

      <!-- DevOps -->
      <section id="devops" class="section" aria-labelledby="devops-title">
        <div class="container">
          <SectionHead index="05" eyebrow="DevOps" title="Infrastructure and deployment workflow" title-id="devops-title" />
          <div class="devops-grid">
            <article
              v-for="(item, index) in devopsCards"
              :key="item.title"
              class="tile devops-tile reveal"
              :style="revealDelay(index)"
            >
              <span class="icon-badge"><i :class="item.icon" aria-hidden="true"></i></span>
              <h3>{{ item.title }}</h3>
              <p>{{ item.text }}</p>
            </article>
          </div>
          <div class="flow tile reveal">
            <p class="tile-label">Deployment architecture flow</p>
            <ol class="flow-steps" role="list">
              <li v-for="(step, index) in flowSteps" :key="step.label" class="flow-step">
                <span class="flow-node">
                  <i :class="step.icon" aria-hidden="true"></i>
                  {{ step.label }}
                </span>
                <i v-if="index < flowSteps.length - 1" class="bi bi-arrow-right flow-arrow" aria-hidden="true"></i>
              </li>
            </ol>
          </div>
        </div>
      </section>

      <!-- Education -->
      <section id="education" class="section" aria-labelledby="education-title">
        <div class="container">
          <SectionHead index="06" eyebrow="Education" title="Academic background" title-id="education-title" />
          <div class="edu-grid">
            <article
              v-for="(item, index) in education"
              :key="item.school"
              class="tile edu-tile reveal"
              :style="revealDelay(index)"
            >
              <span class="icon-badge"><i class="bi bi-mortarboard-fill" aria-hidden="true"></i></span>
              <div>
                <h3>{{ item.degree }}</h3>
                <p>{{ item.school }}</p>
              </div>
              <span class="edu-period">{{ item.period }}</span>
            </article>
          </div>
        </div>
      </section>

      <!-- Contact: closing CTA band -->
      <section id="contact" class="section section-contact" aria-labelledby="contact-title">
        <div class="container">
          <div class="cta-band reveal">
            <p class="eyebrow eyebrow-invert">
              <span class="eyebrow-index">07</span>
              Contact
            </p>
            <h2 id="contact-title">Let’s build reliable products together</h2>
            <div class="cta-actions">
              <a
                v-for="(item, index) in ctaContacts"
                :key="item.label"
                class="btn btn-lg"
                :class="index === 0 ? 'btn-light' : 'btn-outline-light'"
                :href="item.href"
                v-bind="item.href.startsWith('mailto:') ? {} : { target: '_blank', rel: 'noopener noreferrer' }"
              >
                <i :class="item.icon" aria-hidden="true"></i>
                {{ item.label }}
              </a>
            </div>
            <ul class="cta-details" role="list">
              <li v-for="item in contacts" :key="item.label">
                <span class="cta-detail-label">
                  <i :class="item.icon" aria-hidden="true"></i>
                  {{ item.label }}
                </span>
                <a
                  :href="item.href"
                  v-bind="item.href.startsWith('mailto:') ? {} : { target: '_blank', rel: 'noopener noreferrer' }"
                >
                  {{ item.value }}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </main>

    <footer id="site-footer" class="site-footer">
      <div class="container footer-inner">
        <a class="brand" href="#hero" @click="handleNavClick('hero')">
          <BrandMark :size="28" />
          <span class="brand-name">Vireak Roeun</span>
        </a>
        <p class="footer-copy">© {{ currentYear }} Vireak Roeun · Phnom Penh, Cambodia</p>
        <a class="footer-top" href="#hero" @click="handleNavClick('hero')">
          Back to top
          <i class="bi bi-arrow-up" aria-hidden="true"></i>
        </a>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import BrandMark from '@/components/BrandMark.vue';
import SectionHead from '@/components/SectionHead.vue';
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

// Top nav shows every section except Home (the logo links back to the top).
const menuItems = navItems.filter((item) => item.id !== 'hero');

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

// Hero "core stack" tile: technologies already listed in the tagline and skills.
const heroStack = [
  { label: 'Laravel', icon: 'bi bi-hdd-stack' },
  { label: 'Vue.js', icon: 'bi bi-window-stack' },
  { label: 'Quasar', icon: 'bi bi-grid-1x2' },
  { label: 'AWS', icon: 'bi bi-cloud-check' },
  { label: 'Docker', icon: 'bi bi-box-seam' },
  { label: 'Coolify', icon: 'bi bi-lightning-charge' }
];

const highlights = [
  { icon: 'bi bi-diagram-3', text: 'Backend API design and multi-service platform integration' },
  { icon: 'bi bi-git', text: 'CI/CD with GitHub Actions and staging-to-production checks' },
  { icon: 'bi bi-box-seam', text: 'Docker, Coolify, and server management on Ubuntu/VPS' },
  { icon: 'bi bi-people', text: 'Mentoring, code review, and careful production shipping' },
  { icon: 'bi bi-translate', text: 'English (professional) · Khmer (native)' }
];

const skillGroups = [
  {
    title: 'Backend',
    icon: 'bi bi-hdd-stack',
    items: ['PHP', 'Laravel', 'RESTful API design', 'Node.js', 'Auth & multi-service platforms']
  },
  {
    title: 'Frontend',
    icon: 'bi bi-window-stack',
    items: ['Vue.js', 'Quasar', 'HTML', 'CSS', 'JavaScript', 'PWA-oriented UI', 'Master-dashboard / CRM UI']
  },
  {
    title: 'Database',
    icon: 'bi bi-database',
    items: ['MySQL', 'Relational modeling', 'Data validation & integrity']
  },
  {
    title: 'DevOps & infrastructure',
    icon: 'bi bi-cloud-check',
    items: [
      'Docker',
      'CI/CD & GitHub Actions',
      'AWS & VPS deployment',
      'Ubuntu Server / Linux',
      'Coolify',
      'Nixpacks',
      'Cloudflare Tunnel',
      'Domain / DNS / SSL',
      'Backups & rollback-ready releases',
      'Staging → production checks',
      'GitHub (branches/PRs)',
      'Self-hosted AI (Ollama, Open WebUI)'
    ]
  }
];

const projects = [
  {
    title: 'IBF Dashboard & multi-service platform',
    icon: 'bi bi-speedometer2',
    description:
      'Auth, product, events, and CRM engines with a master-dashboard Quasar UI, backed by Laravel APIs for the Institute of Banking and Finance.',
    tech: ['Laravel', 'Vue.js', 'Quasar', 'MySQL', 'REST API']
  },
  {
    title: 'MaxTune',
    icon: 'bi bi-music-note-beamed',
    description:
      'Personal music platform with a Vue/Quasar SPA and Laravel engine, hosted on Coolify with Docker.',
    tech: ['Laravel', 'Vue.js', 'Quasar', 'Coolify', 'Docker']
  },
  {
    title: 'Client DevOps setup & training',
    icon: 'bi bi-hdd-network',
    description:
      'Delivered VPS, Coolify, domain/SSL, and CI/CD setup for clients, plus an 8-session weekend training package.',
    tech: ['Coolify', 'Docker', 'GitHub Actions', 'Ubuntu', 'DNS/SSL']
  },
  {
    title: 'Full-stack teaching course',
    icon: 'bi bi-journal-code',
    description:
      '60-hour Laravel + Vue curriculum with a Class Manager capstone, delivered bilingual in English and Khmer.',
    tech: ['Laravel', 'Vue.js']
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

const flowSteps = [
  { label: 'Vue Frontend', icon: 'bi bi-window-stack' },
  { label: 'Laravel API', icon: 'bi bi-hdd-stack' },
  { label: 'Docker Container', icon: 'bi bi-box-seam' },
  { label: 'AWS / VPS', icon: 'bi bi-cloud-arrow-up' },
  { label: 'GitHub Actions CI/CD', icon: 'bi bi-git' }
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

const ctaContacts = contacts.filter((item) => ['Email', 'Telegram', 'LinkedIn'].includes(item.label));
const locationLink = contacts.find((item) => item.label === 'Location').href;

const currentYear = new Date().getFullYear();
const activeSection = ref('hero');
const isMenuOpen = ref(false);
const isScrolled = ref(false);
let revealObserver;

// Light stagger for items in a grid (capped so long lists don't drag).
const revealDelay = (index) => ({ '--reveal-delay': `${Math.min(index, 4) * 70}ms` });

const updateActiveSection = () => {
  // Bottom of the page: the short contact section may never reach the offset line.
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
    activeSection.value = 'contact';
    return;
  }

  const scrollPosition = window.scrollY + 120;

  for (const { id } of navItems) {
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

let ticking = false;
const handleScroll = () => {
  if (ticking) {
    return;
  }
  ticking = true;
  window.requestAnimationFrame(() => {
    isScrolled.value = window.scrollY > 8;
    updateActiveSection();
    ticking = false;
  });
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

const handleKeydown = (event) => {
  if (event.key === 'Escape' && isMenuOpen.value) {
    closeMenu();
    document.querySelector('.nav-toggle')?.focus();
  }
};

// Close the mobile menu if the viewport grows past the mobile breakpoint.
const handleResize = () => {
  if (isMenuOpen.value && window.innerWidth >= 1024) {
    closeMenu();
  }
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('resize', handleResize);
  isScrolled.value = window.scrollY > 8;
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
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('resize', handleResize);
  if (revealObserver) {
    revealObserver.disconnect();
  }
});
</script>
