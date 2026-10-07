<template>
  <div class="page course-page">
    <a class="skip-link" href="#main">Skip to content</a>

    <header class="site-header" :class="{ 'is-scrolled': isScrolled }">
      <div class="container nav-bar">
        <router-link class="brand" to="/" aria-label="Vireak Roeun, back to home">
          <BrandMark :size="32" />
          <span class="brand-name">Vireak Roeun</span>
        </router-link>
        <router-link class="btn btn-ghost btn-sm" to="/">
          <i class="bi bi-arrow-left" aria-hidden="true"></i>
          Back to home
        </router-link>
      </div>
    </header>

    <main id="main">
      <!-- Hero: one composition — brand, headline, support, CTAs, full-bleed photo -->
      <section class="course-hero" aria-labelledby="course-title">
        <div class="course-hero-media" aria-hidden="true">
          <picture>
            <source :srcset="profileWebp" type="image/webp" />
            <img :src="profileJpg" alt="" width="520" height="520" decoding="async" class="course-hero-photo" />
          </picture>
          <div class="course-hero-shade" />
        </div>
        <div class="container course-hero-copy">
          <p class="course-brand">Vireak Roeun</p>
          <h1 id="course-title" class="course-hero-title">{{ course.title }}</h1>
          <p class="course-hero-lede">{{ course.description }}</p>
          <div class="course-hero-actions">
            <button class="btn btn-accent btn-lg" type="button" @click="goEnroll()">
              Request a seat
              <i class="bi bi-arrow-right" aria-hidden="true"></i>
            </button>
            <a class="btn btn-ghost btn-lg" :href="contact.telegramUrl" target="_blank" rel="noopener noreferrer">
              <i class="bi bi-telegram" aria-hidden="true"></i>
              Telegram
            </a>
          </div>
        </div>
      </section>

      <!-- Outline -->
      <section id="outline" class="section course-section" aria-labelledby="outline-title">
        <div class="container course-narrow">
          <SectionHead
            index="01"
            eyebrow="Curriculum"
            title="60 hours from foundations to a shipped capstone"
            title-id="outline-title"
          />
          <ol class="outline-list">
            <li v-for="(m, i) in displayModules" :key="m.id || i" class="outline-item">
              <span class="outline-index">{{ String(i + 1).padStart(2, '0') }}</span>
              <div class="outline-body">
                <h3>{{ m.title }}</h3>
                <p>{{ m.description }}</p>
              </div>
              <span class="outline-hours">{{ m.hours }}h</span>
            </li>
          </ol>
        </div>
      </section>

      <!-- Classes -->
      <section id="classes" class="section course-section course-section-tint" aria-labelledby="classes-title">
        <div class="container course-narrow">
          <SectionHead
            index="02"
            eyebrow="Upcoming classes"
            title="Pick an intake, then request your seat"
            title-id="classes-title"
          />
          <ul v-if="openCohorts.length" class="seat-list">
            <li v-for="c in openCohorts" :key="c.id" class="seat-row">
              <div>
                <h3>{{ c.title }}</h3>
                <p>
                  {{ formatCohortDates(c) }}
                  <template v-if="c.schedule_text"> · {{ c.schedule_text }}</template>
                </p>
                <p class="seat-meta">
                  {{ formatLabel(c.format) }} · {{ c.seats_left }} of {{ c.seats }} seats left
                </p>
              </div>
              <button class="btn btn-accent" type="button" @click="goEnroll(c)">Request a seat</button>
            </li>
          </ul>
          <p v-else class="seat-empty">
            New intakes will appear here when seats open. You can still send a request below — I’ll follow up with dates.
          </p>
        </div>
      </section>

      <!-- Enroll -->
      <section id="enroll" ref="enrollEl" class="section course-section" aria-labelledby="enroll-title">
        <div class="container course-enroll-layout">
          <div class="course-enroll-intro">
            <SectionHead
              index="03"
              eyebrow="Enroll"
              title="Request a seat"
              title-id="enroll-title"
            />
            <p class="course-enroll-note">
              Tell me a little about yourself and what you’d like to learn.
              <template v-if="apiEnabled"> I’ll get your request straight away and reply by email.</template>
              <template v-else> Submitting opens your email app with everything filled in.</template>
            </p>
            <p v-if="selectedCohort" class="cohort-chip">
              Seat request for <strong>{{ selectedCohort.title }}</strong>
              <button type="button" class="link-button" @click="selectedCohort = null">Clear</button>
            </p>
            <ul class="enroll-facts" role="list">
              <li v-for="item in course.highlights" :key="item.label">
                <i :class="item.icon" aria-hidden="true"></i>
                {{ item.label }}
              </li>
            </ul>
          </div>

          <div class="course-enroll-panel" role="region" aria-labelledby="enroll-title">
            <div v-if="submitted && submittedVia === 'api'" class="form-success" role="status">
              <span class="success-icon" aria-hidden="true"><i class="bi bi-check-lg"></i></span>
              <h3 ref="successHeading" tabindex="-1">Enrollment request received</h3>
              <p>
                I’ll contact you at <strong>{{ form.email.trim() }}</strong>
                <template v-if="form.contact.trim()"> or on the contact you shared</template>.
              </p>
              <div class="form-success-actions">
                <a class="btn btn-ghost" :href="contact.telegramUrl" target="_blank" rel="noopener noreferrer">
                  <i class="bi bi-telegram" aria-hidden="true"></i>
                  Telegram
                </a>
                <button class="btn btn-ghost" type="button" @click="startNewEnquiry">Send another</button>
              </div>
            </div>

            <div v-else-if="submitted" class="form-success" role="status">
              <span class="success-icon" aria-hidden="true"><i class="bi bi-check-lg"></i></span>
              <h3 ref="successHeading" tabindex="-1">Almost done — press Send</h3>
              <p>
                Your email app should open with the request to <strong>{{ contact.email }}</strong>.
              </p>
              <div class="form-success-actions">
                <a class="btn btn-accent" :href="mailtoHref">Open email again</a>
                <button class="btn btn-ghost" type="button" @click="copyEnquiry">
                  {{ copyState === 'copied' ? 'Copied' : 'Copy request' }}
                </button>
              </div>
              <p class="copy-note" aria-live="polite">
                <template v-if="copyState === 'copied'">Copied — paste it into Telegram if you prefer.</template>
                <template v-else-if="copyState === 'failed'">Couldn’t copy — select the text below.</template>
              </p>
              <textarea
                v-if="copyState === 'failed'"
                class="input enquiry-preview"
                :value="enquiryText"
                readonly
                rows="8"
                aria-label="Your enrollment request text"
              />
              <button class="link-button" type="button" @click="editEnquiry">Edit my request</button>
            </div>

            <form v-else class="course-form" novalidate :aria-busy="sending ? 'true' : 'false'" @submit.prevent="handleSubmit">
              <div v-if="apiError" class="form-alert" role="alert">
                <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
                <span>
                  {{ apiError }}
                  <span class="form-alert-actions">
                    <a :href="mailtoHref" @click="markMailtoFallback">Email instead</a>
                    ·
                    <a :href="contact.telegramUrl" target="_blank" rel="noopener noreferrer">Telegram</a>
                  </span>
                </span>
              </div>

              <div class="hp-field" aria-hidden="true">
                <label for="cf-website">Website</label>
                <input id="cf-website" v-model="honeypot" type="text" name="website" tabindex="-1" autocomplete="off" />
              </div>

              <div v-if="showSummary && errorCount" class="form-alert" role="alert">
                <i class="bi bi-info-circle-fill" aria-hidden="true"></i>
                <span>
                  {{ errorCount === 1 ? 'One thing needs a quick look' : `${errorCount} things need a quick look` }}
                  before sending.
                </span>
              </div>

              <div class="form-row">
                <div class="field" :class="{ 'has-error': showError('name') }">
                  <label class="field-label" for="cf-name">Your name</label>
                  <input
                    id="cf-name"
                    v-model="form.name"
                    class="input"
                    type="text"
                    name="name"
                    autocomplete="name"
                    maxlength="80"
                    :aria-invalid="showError('name') ? 'true' : 'false'"
                    :aria-describedby="showError('name') ? 'cf-name-error' : undefined"
                    @blur="touch('name')"
                  />
                  <p v-if="showError('name')" id="cf-name-error" class="field-error">{{ allErrors.name }}</p>
                </div>
                <div class="field" :class="{ 'has-error': showError('email') }">
                  <label class="field-label" for="cf-email">Email</label>
                  <input
                    id="cf-email"
                    v-model="form.email"
                    class="input"
                    type="email"
                    name="email"
                    autocomplete="email"
                    inputmode="email"
                    maxlength="120"
                    :aria-invalid="showError('email') ? 'true' : 'false'"
                    :aria-describedby="showError('email') ? 'cf-email-error' : undefined"
                    @blur="touch('email')"
                  />
                  <p v-if="showError('email')" id="cf-email-error" class="field-error">{{ allErrors.email }}</p>
                </div>
              </div>

              <div class="field" :class="{ 'has-error': showError('contact') }">
                <label class="field-label" for="cf-contact">
                  Phone or Telegram <span class="field-optional">(optional)</span>
                </label>
                <input
                  id="cf-contact"
                  v-model="form.contact"
                  class="input"
                  type="text"
                  name="contact"
                  autocomplete="tel"
                  maxlength="80"
                  placeholder="e.g. 012 345 678 or @username"
                  :aria-invalid="showError('contact') ? 'true' : 'false'"
                  @blur="touch('contact')"
                />
                <p v-if="showError('contact')" class="field-error">{{ allErrors.contact }}</p>
              </div>

              <fieldset class="field choice-field" :class="{ 'has-error': showError('language') }">
                <legend class="field-label">Preferred language</legend>
                <div class="choice-group">
                  <label v-for="option in languageOptions" :key="option.value" class="choice">
                    <input v-model="form.language" type="radio" name="language" :value="option.value" @change="touch('language')" />
                    {{ option.label }}
                  </label>
                </div>
                <p v-if="showError('language')" class="field-error">{{ allErrors.language }}</p>
              </fieldset>

              <fieldset class="field choice-field" :class="{ 'has-error': showError('format') }">
                <legend class="field-label">Learning format</legend>
                <div class="choice-group">
                  <label v-for="option in formatOptions" :key="option.value" class="choice">
                    <input v-model="form.format" type="radio" name="format" :value="option.value" @change="touch('format')" />
                    {{ option.label }}
                  </label>
                </div>
                <p v-if="showError('format')" class="field-error">{{ allErrors.format }}</p>
              </fieldset>

              <div class="field" :class="{ 'has-error': showError('level') }">
                <label class="field-label" for="cf-level">Your experience level</label>
                <div class="select-wrap">
                  <select
                    id="cf-level"
                    v-model="form.level"
                    class="input"
                    name="level"
                    :aria-invalid="showError('level') ? 'true' : 'false'"
                    @blur="touch('level')"
                    @change="touch('level')"
                  >
                    <option value="" disabled>Choose one…</option>
                    <option v-for="option in levelOptions" :key="option" :value="option">{{ option }}</option>
                  </select>
                  <i class="bi bi-chevron-down" aria-hidden="true"></i>
                </div>
                <p v-if="showError('level')" class="field-error">{{ allErrors.level }}</p>
              </div>

              <div class="field" :class="{ 'has-error': showError('message') }">
                <label class="field-label" for="cf-message">Message</label>
                <textarea
                  id="cf-message"
                  v-model="form.message"
                  class="input"
                  name="message"
                  rows="5"
                  :maxlength="MESSAGE_MAX"
                  placeholder="What would you like to learn?"
                  :aria-invalid="showError('message') ? 'true' : 'false'"
                  @blur="touch('message')"
                />
                <p class="field-hint field-count">{{ form.message.length }} / {{ MESSAGE_MAX }}</p>
                <p v-if="showError('message')" class="field-error">{{ allErrors.message }}</p>
              </div>

              <div class="form-submit">
                <button class="btn btn-accent btn-lg" type="submit" :disabled="sending">
                  <span v-if="sending" class="btn-spinner" aria-hidden="true"></span>
                  <i v-else class="bi bi-send" aria-hidden="true"></i>
                  {{ sending ? 'Sending…' : 'Request enrollment' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <!-- Instructor -->
      <section id="instructor" class="section course-section course-section-tint" aria-labelledby="instructor-title">
        <div class="container course-instructor-layout">
          <picture class="course-instructor-photo">
            <source :srcset="profileWebp" type="image/webp" />
            <img :src="profileJpg" alt="Vireak Roeun" width="520" height="520" decoding="async" />
          </picture>
          <div>
            <p class="tile-label">Your instructor</p>
            <h2 id="instructor-title" class="course-instructor-name">Vireak Roeun</h2>
            <p class="course-instructor-role">Senior DevOps Officer &amp; Full-Stack Developer</p>
            <ul class="instructor-facts" role="list">
              <li v-for="item in instructorFacts" :key="item.text">
                <span class="highlight-icon"><i :class="item.icon" aria-hidden="true"></i></span>
                {{ item.text }}
              </li>
            </ul>
            <div class="course-instructor-links">
              <a
                v-for="item in directContacts"
                :key="item.label"
                class="btn btn-ghost"
                :href="item.href"
                v-bind="item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {}"
              >
                <i :class="item.icon" aria-hidden="true"></i>
                {{ item.label }}
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- FAQ -->
      <section id="faq" class="section course-section" aria-labelledby="faq-title">
        <div class="container course-narrow">
          <SectionHead index="04" eyebrow="FAQ" title="Quick answers" title-id="faq-title" />
          <div class="faq-list faq-list-single">
            <details v-for="item in faqs" :key="item.q" class="faq-item">
              <summary>
                {{ item.q }}
                <i class="bi bi-plus-lg" aria-hidden="true"></i>
              </summary>
              <p>{{ item.a }}</p>
            </details>
          </div>
        </div>
      </section>
    </main>

    <div class="enroll-bar" :class="{ 'is-hidden': enrollInView }" :inert="enrollInView">
      <button class="btn btn-accent btn-block" type="button" @click="goEnroll()">
        <i class="bi bi-mortarboard-fill" aria-hidden="true"></i>
        Request a seat
      </button>
    </div>

    <footer class="site-footer">
      <div class="container footer-inner">
        <router-link class="brand" to="/">
          <BrandMark :size="28" />
          <span class="brand-name">Vireak Roeun</span>
        </router-link>
        <p class="footer-copy">© {{ currentYear }} Vireak Roeun · Phnom Penh, Cambodia</p>
        <router-link class="footer-top" to="/">
          <i class="bi bi-arrow-left" aria-hidden="true"></i>
          Back to home
        </router-link>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import BrandMark from '@/components/BrandMark.vue'
import SectionHead from '@/components/SectionHead.vue'
import { apiConfigured as apiEnabled, engineAPI, ApiError } from '@/helpers/api'
import profileWebp from '@/assets/img/profile-520.webp'
import profileJpg from '@/assets/img/profile-520.jpg'

const COURSE_SLUG = 'full-stack-teaching-course'
const remoteCourse = ref(null)
const selectedCohort = ref(null)

const staticModules = [
  { id: 's1', title: 'Web foundations', hours: 8, description: 'HTML, CSS, JavaScript refreshers and tooling.' },
  { id: 's2', title: 'PHP & Laravel core', hours: 16, description: 'Routing, Eloquent, validation, auth, and APIs.' },
  { id: 's3', title: 'Vue frontend', hours: 16, description: 'Components, routing, forms, and talking to Laravel APIs.' },
  { id: 's4', title: 'Class Manager capstone', hours: 20, description: 'An end-to-end app that ties Laravel and Vue together.' },
]

const displayModules = computed(() =>
  remoteCourse.value?.modules?.length ? remoteCourse.value.modules : staticModules,
)

const openCohorts = computed(() =>
  (remoteCourse.value?.cohorts || []).filter((c) => c.status === 'open' || c.status === 'full'),
)

const formatCohortDates = (c) => {
  const fmt = (d) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null
  const start = fmt(c.start_date)
  const end = fmt(c.end_date)
  if (start && end) return `${start} – ${end}`
  return start || end || 'Dates TBC'
}

const formatLabel = (format) => String(format || '').replaceAll('_', ' ')

const goEnroll = async (cohort = null) => {
  if (cohort) selectedCohort.value = cohort
  await nextTick()
  document.getElementById('enroll')?.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    block: 'start',
  })
  window.setTimeout(() => document.getElementById('cf-name')?.focus(), 400)
}

const loadRemoteCourse = async () => {
  if (!apiEnabled) return
  try {
    const { data } = await engineAPI.get(`/courses/${COURSE_SLUG}`)
    remoteCourse.value = data?.data || data
    if (remoteCourse.value?.title) {
      course.title = remoteCourse.value.title
      if (remoteCourse.value.summary) course.description = remoteCourse.value.summary
    }
  } catch {
    /* keep static fallback */
  }
}

const contact = {
  email: 'roeunvireak0@gmail.com',
  telegramUrl: 'https://t.me/R_Vireak',
  telegramHandle: '@R_Vireak',
}

const course = {
  title: 'Full-stack teaching course',
  description:
    '60-hour Laravel + Vue curriculum with a Class Manager capstone, taught bilingually in English and Khmer.',
  highlights: [
    { label: '60 hours', icon: 'bi bi-clock' },
    { label: 'Laravel + Vue', icon: 'bi bi-stack' },
    { label: 'English & Khmer', icon: 'bi bi-translate' },
    { label: 'Class Manager capstone', icon: 'bi bi-kanban' },
  ],
}

const instructorFacts = [
  {
    icon: 'bi bi-easel',
    text: 'Programming Instructor at ANT Training Center (2024 – 2025), teaching PHP, Laravel, MySQL, and OOP',
  },
  {
    icon: 'bi bi-hdd-stack',
    text: 'Builds Laravel, Vue, and Quasar systems in production at the Institute of Banking and Finance',
  },
  { icon: 'bi bi-translate', text: 'English (professional) · Khmer (native)' },
]

const directContacts = [
  {
    label: 'Email',
    value: contact.email,
    href: `mailto:${contact.email}?subject=${encodeURIComponent('Course enrollment')}`,
    icon: 'bi bi-envelope-fill',
    external: false,
  },
  {
    label: 'Telegram',
    value: contact.telegramHandle,
    href: contact.telegramUrl,
    icon: 'bi bi-telegram',
    external: true,
  },
]

const faqs = [
  { q: 'How long is the course?', a: 'The curriculum is 60 hours in total.' },
  {
    q: 'What will I learn?',
    a: 'Full-stack web development with Laravel on the backend and Vue on the frontend.',
  },
  {
    q: 'What do I build?',
    a: 'A Class Manager capstone that brings the Laravel and Vue parts of the curriculum together.',
  },
  {
    q: 'Which language is it taught in?',
    a: 'Bilingual English and Khmer. Tell me your preference in the enrollment form.',
  },
  {
    q: 'Where can I find fees, dates, and schedules?',
    a: 'Request a seat or message me on Telegram — I’ll share the current intake details.',
  },
]

const languageOptions = [
  { value: 'English', label: 'English' },
  { value: 'Khmer', label: 'Khmer (ខ្មែរ)' },
]

const formatOptions = [
  { value: 'Online', label: 'Online' },
  { value: 'In person', label: 'In person' },
  { value: 'Either', label: 'Either is fine' },
]

const levelOptions = [
  'Complete beginner',
  'Some HTML, CSS, or JavaScript',
  'Some PHP or Laravel',
  'Working developer',
]

const MESSAGE_MAX = 2000
const FIELD_ORDER = ['name', 'email', 'contact', 'language', 'format', 'level', 'message']
const FIELD_IDS = {
  name: 'cf-name',
  email: 'cf-email',
  contact: 'cf-contact',
  language: 'cf-language',
  format: 'cf-format',
  level: 'cf-level',
  message: 'cf-message',
}

const form = reactive({
  name: '',
  email: '',
  contact: '',
  language: '',
  format: '',
  level: '',
  message: '',
})

const LANGUAGE_CODES = { English: 'en', Khmer: 'km' }
const FORMAT_CODES = { Online: 'online', 'In person': 'in_person', Either: 'either' }

const honeypot = ref('')
const sending = ref(false)
const submittedVia = ref('mailto')
const apiMessage = ref('')
const apiError = ref('')
const serverErrors = reactive({})
const touched = reactive({})
const showSummary = ref(false)
const submitted = ref(false)
const copyState = ref('idle')
const successHeading = ref(null)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_RE = /^\+?[\d\s().-]{6,20}$/
const TELEGRAM_RE = /^(?:@|(?:https?:\/\/)?t\.me\/)?[A-Za-z][A-Za-z0-9_]{4,31}$/

const errors = computed(() => {
  const result = {}
  const name = form.name.trim()
  const email = form.email.trim()
  const contactValue = form.contact.trim()
  const message = form.message.trim()

  if (!name) result.name = 'Please tell me your name.'
  else if (name.length < 2) result.name = 'Could you add your full name?'

  if (!email) result.email = 'Please add your email so I can reply.'
  else if (!EMAIL_RE.test(email)) result.email = 'That email doesn’t look quite right — could you double-check it?'

  if (contactValue) {
    const digits = contactValue.replace(/\D/g, '').length
    const looksLikePhone = PHONE_RE.test(contactValue) && digits >= 6
    if (!looksLikePhone && !TELEGRAM_RE.test(contactValue)) {
      result.contact = 'Please enter a phone number or a Telegram username like @username — or leave this empty.'
    }
  }

  if (!form.language) result.language = 'Please choose the language you’d prefer.'
  if (!form.format) result.format = 'Please pick the format you’re interested in.'
  if (!form.level) result.level = 'Please choose the option closest to your experience.'

  if (!message) result.message = 'Please add a short message about what you’d like to learn.'
  else if (message.length < 10) result.message = 'Could you add a little more detail? A sentence or two is perfect.'

  return result
})

const allErrors = computed(() => {
  const merged = { ...errors.value }
  for (const [field, message] of Object.entries(serverErrors)) {
    if (message && !merged[field]) merged[field] = message
  }
  return merged
})

FIELD_ORDER.forEach((field) => {
  watch(
    () => form[field],
    () => {
      delete serverErrors[field]
    },
  )
})

const errorCount = computed(() => Object.keys(allErrors.value).length)
const showError = (field) => Boolean(allErrors.value[field]) && Boolean(touched[field] || showSummary.value)
const touch = (field) => {
  touched[field] = true
}

const enquiryText = computed(() => {
  const lines = [
    'Hi Vireak,',
    '',
    `I'd like to enroll in your ${course.title} (60-hour Laravel + Vue).`,
    '',
    `Name: ${form.name.trim()}`,
    `Email: ${form.email.trim()}`,
    `Phone / Telegram: ${form.contact.trim() || 'Not provided'}`,
    `Preferred language: ${form.language}`,
    `Learning format: ${form.format}`,
    `Experience level: ${form.level}`,
    '',
    'Message:',
    form.message.trim(),
    '',
    '— Sent from the course enrollment page on roeun-vireak.mxlab.site',
  ]
  return lines.join('\r\n')
})

const mailtoHref = computed(() => {
  const subject = `Course enrollment request – ${form.name.trim() || 'Full-stack teaching course'}`
  return `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(enquiryText.value)}`
})

const focusField = (field) => {
  const id = FIELD_IDS[field]
  const el =
    field === 'language' || field === 'format'
      ? document.querySelector(`input[name="${field}"]`)
      : document.getElementById(id)
  el?.focus()
  el?.scrollIntoView({
    block: 'center',
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
  })
}

const showSuccess = async (via) => {
  submittedVia.value = via
  submitted.value = true
  copyState.value = 'idle'
  await nextTick()
  successHeading.value?.focus()
}

const markMailtoFallback = () => {
  showSuccess('mailto')
}

const focusFirstError = async () => {
  const first = FIELD_ORDER.find((field) => allErrors.value[field])
  await nextTick()
  if (first) focusField(first)
}

const submitToApi = async () => {
  const payload = {
    name: form.name.trim(),
    email: form.email.trim(),
    contact: form.contact.trim() || null,
    language: LANGUAGE_CODES[form.language] ?? form.language,
    format: FORMAT_CODES[form.format] ?? form.format,
    level: form.level,
    message: form.message.trim(),
    website: honeypot.value,
    course_id: remoteCourse.value?.id || null,
    cohort_id: selectedCohort.value?.id || null,
  }

  try {
    const { data } = await engineAPI.post('/course-enquiries', payload)
    apiMessage.value = typeof data?.message === 'string' ? data.message : ''
    await showSuccess('api')
  } catch (e) {
    if (e instanceof ApiError && e.status === 422 && e.errors) {
      for (const [field, messages] of Object.entries(e.errors)) {
        if (FIELD_ORDER.includes(field)) {
          serverErrors[field] = Array.isArray(messages) ? messages[0] : String(messages)
        }
      }
      if (Object.keys(serverErrors).length) {
        showSummary.value = true
        await focusFirstError()
        return
      }
    }

    if (e instanceof ApiError && e.status === 0) {
      apiError.value =
        'I couldn’t reach the server — please check your connection and try again, or send your request by email or Telegram.'
      return
    }

    apiError.value =
      e instanceof ApiError && e.status === 429
        ? 'You’ve sent a few requests in a row — please wait a minute and try again, or reach me by email or Telegram.'
        : 'Sorry, something went wrong on my side and your request wasn’t sent. Please try again in a moment, or use email or Telegram.'
  }
}

const handleSubmit = async () => {
  if (sending.value) return
  FIELD_ORDER.forEach(touch)
  showSummary.value = true
  apiError.value = ''

  if (errorCount.value) {
    await focusFirstError()
    return
  }

  if (apiEnabled) {
    sending.value = true
    try {
      await submitToApi()
    } finally {
      sending.value = false
    }
    return
  }

  submittedVia.value = 'mailto'
  submitted.value = true
  copyState.value = 'idle'
  await nextTick()
  successHeading.value?.focus()
  window.location.href = mailtoHref.value
}

const copyEnquiry = async () => {
  try {
    await navigator.clipboard.writeText(enquiryText.value)
    copyState.value = 'copied'
  } catch {
    copyState.value = 'failed'
  }
}

const startNewEnquiry = async () => {
  Object.assign(form, { name: '', email: '', contact: '', language: '', format: '', level: '', message: '' })
  Object.keys(touched).forEach((key) => delete touched[key])
  Object.keys(serverErrors).forEach((key) => delete serverErrors[key])
  apiMessage.value = ''
  await editEnquiry()
}

const editEnquiry = async () => {
  submitted.value = false
  showSummary.value = false
  await nextTick()
  document.getElementById('cf-name')?.focus()
}

const currentYear = new Date().getFullYear()
const isScrolled = ref(false)
const handleScroll = () => {
  isScrolled.value = window.scrollY > 8
}

const enrollEl = ref(null)
const enrollInView = ref(false)
let enrollObserver

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
  loadRemoteCourse()
  if (window.location.hash === '#enroll') {
    window.setTimeout(() => goEnroll(), 100)
  }
  if ('IntersectionObserver' in window && enrollEl.value) {
    enrollObserver = new IntersectionObserver(
      ([entry]) => {
        enrollInView.value = entry.isIntersecting
      },
      { threshold: 0.1 },
    )
    enrollObserver.observe(enrollEl.value)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  enrollObserver?.disconnect()
})
</script>
