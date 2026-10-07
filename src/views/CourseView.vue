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
      <!-- Hero -->
      <section class="course-hero" aria-labelledby="course-title">
        <div class="container course-hero-grid">
          <div class="tile tile-intro course-intro">
            <p class="eyebrow eyebrow-accent">
              <i class="bi bi-journal-code" aria-hidden="true"></i>
              Online course · Enrolling now
            </p>
            <h1 id="course-title">{{ course.title }}</h1>
            <p class="hero-tagline course-tagline">{{ course.description }}</p>
            <ul class="course-chips" role="list" aria-label="Course highlights">
              <li v-for="item in course.highlights" :key="item.label" class="course-chip">
                <i :class="item.icon" aria-hidden="true"></i>
                {{ item.label }}
              </li>
            </ul>
            <div class="hero-actions">
              <a class="btn btn-accent btn-lg" href="#enroll">
                Enroll now
                <i class="bi bi-arrow-right" aria-hidden="true"></i>
              </a>
              <a class="btn btn-ghost btn-lg" :href="contact.telegramUrl" target="_blank" rel="noopener noreferrer">
                <i class="bi bi-telegram" aria-hidden="true"></i>
                Message on Telegram
              </a>
            </div>
          </div>

          <div id="enroll" ref="enrollEl" class="tile course-form-tile" role="region" aria-labelledby="enroll-title">
            <header class="course-form-head">
              <p class="eyebrow">
                <span class="eyebrow-index">01</span>
                Enroll / Request a seat
              </p>
              <h2 id="enroll-title">Request a seat</h2>
              <p class="tile-note">
                Tell me a little about yourself and what you’d like to learn, and I’ll get in touch about your seat.
                <template v-if="apiEnabled">I’ll get your request straight away and reply by email.</template>
                <template v-else>Submitting opens your email app with everything filled in, ready to send.</template>
              </p>
            </header>

            <div v-if="submitted && submittedVia === 'api'" class="form-success" role="status">
              <span class="success-icon" aria-hidden="true"><i class="bi bi-check-lg"></i></span>
              <h3 ref="successHeading" tabindex="-1">Enrollment request received!</h3>
              <p>
                I’ve received your enrollment request and I’ll contact you at <strong>{{ form.email.trim() }}</strong>
                <template v-if="form.contact.trim()"> or on the contact you shared</template>.
              </p>
              <div class="form-success-actions">
                <a class="btn btn-ghost" :href="contact.telegramUrl" target="_blank" rel="noopener noreferrer">
                  <i class="bi bi-telegram" aria-hidden="true"></i>
                  Message on Telegram
                </a>
                <button class="btn btn-ghost" type="button" @click="startNewEnquiry">
                  <i class="bi bi-plus-lg" aria-hidden="true"></i>
                  Send another request
                </button>
              </div>
            </div>

            <div v-else-if="submitted" class="form-success" role="status">
              <span class="success-icon" aria-hidden="true"><i class="bi bi-check-lg"></i></span>
              <h3 ref="successHeading" tabindex="-1">Almost done — just press Send</h3>
              <p>
                Your email app should now be open with your enrollment request addressed to
                <strong>{{ contact.email }}</strong>. Press <strong>Send</strong> there and I’ll get back to you by email
                <template v-if="form.contact.trim()"> or on the contact you shared</template>.
              </p>
              <p class="tile-note">
                Email app didn’t open? Copy your request and send it on Telegram instead, or email me directly.
              </p>
              <div class="form-success-actions">
                <a class="btn btn-accent" :href="mailtoHref">
                  <i class="bi bi-envelope-fill" aria-hidden="true"></i>
                  Open email again
                </a>
                <button class="btn btn-ghost" type="button" @click="copyEnquiry">
                  <i :class="copyState === 'copied' ? 'bi bi-check2' : 'bi bi-clipboard'" aria-hidden="true"></i>
                  {{ copyState === 'copied' ? 'Copied' : 'Copy request' }}
                </button>
                <a class="btn btn-ghost" :href="contact.telegramUrl" target="_blank" rel="noopener noreferrer">
                  <i class="bi bi-telegram" aria-hidden="true"></i>
                  Message on Telegram
                </a>
              </div>
              <p class="copy-note" aria-live="polite">
                <template v-if="copyState === 'copied'">Copied — paste it into your Telegram message.</template>
                <template v-else-if="copyState === 'failed'">
                  Couldn’t copy automatically. Your request is shown below — select it and copy it by hand.
                </template>
              </p>
              <textarea
                v-if="copyState === 'failed'"
                class="input enquiry-preview"
                :value="enquiryText"
                readonly
                rows="8"
                aria-label="Your enrollment request text"
              ></textarea>
              <button class="link-button" type="button" @click="editEnquiry">
                <i class="bi bi-pencil" aria-hidden="true"></i>
                Edit my request
              </button>
            </div>

            <form v-else class="course-form" novalidate :aria-busy="sending ? 'true' : 'false'" @submit.prevent="handleSubmit">
              <div v-if="apiError" class="form-alert" role="alert">
                <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
                <span>
                  {{ apiError }}
                  <span class="form-alert-actions">
                    <a :href="mailtoHref" @click="markMailtoFallback">Send it by email instead</a>
                    ·
                    <a :href="contact.telegramUrl" target="_blank" rel="noopener noreferrer">Message on Telegram</a>
                  </span>
                </span>
              </div>

              <!-- Honeypot: hidden from people, bots tend to fill it. -->
              <div class="hp-field" aria-hidden="true">
                <label for="cf-website">Website</label>
                <input id="cf-website" v-model="honeypot" type="text" name="website" tabindex="-1" autocomplete="off" />
              </div>

              <div v-if="showSummary && errorCount" class="form-alert" role="alert">
                <i class="bi bi-info-circle-fill" aria-hidden="true"></i>
                <span>
                  {{ errorCount === 1 ? 'One thing needs a quick look' : `${errorCount} things need a quick look` }}
                  before sending — see the notes below.
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
                  <p v-if="showError('name')" id="cf-name-error" class="field-error">
                    <i class="bi bi-exclamation-circle" aria-hidden="true"></i>{{ allErrors.name }}
                  </p>
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
                  <p v-if="showError('email')" id="cf-email-error" class="field-error">
                    <i class="bi bi-exclamation-circle" aria-hidden="true"></i>{{ allErrors.email }}
                  </p>
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
                  :aria-describedby="showError('contact') ? 'cf-contact-hint cf-contact-error' : 'cf-contact-hint'"
                  @blur="touch('contact')"
                />
                <p id="cf-contact-hint" class="field-hint">Only if you’d like a reply there as well as by email.</p>
                <p v-if="showError('contact')" id="cf-contact-error" class="field-error">
                  <i class="bi bi-exclamation-circle" aria-hidden="true"></i>{{ allErrors.contact }}
                </p>
              </div>

              <fieldset
                class="field choice-field"
                :class="{ 'has-error': showError('language') }"
                :aria-describedby="showError('language') ? 'cf-language-error' : undefined"
              >
                <legend class="field-label">Preferred language</legend>
                <div class="choice-group">
                  <label v-for="option in languageOptions" :key="option.value" class="choice">
                    <input
                      v-model="form.language"
                      type="radio"
                      name="language"
                      :value="option.value"
                      @change="touch('language')"
                    />
                    {{ option.label }}
                  </label>
                </div>
                <p v-if="showError('language')" id="cf-language-error" class="field-error">
                  <i class="bi bi-exclamation-circle" aria-hidden="true"></i>{{ allErrors.language }}
                </p>
              </fieldset>

              <fieldset
                class="field choice-field"
                :class="{ 'has-error': showError('format') }"
                :aria-describedby="showError('format') ? 'cf-format-error' : undefined"
              >
                <legend class="field-label">Learning format you’re interested in</legend>
                <div class="choice-group">
                  <label v-for="option in formatOptions" :key="option.value" class="choice">
                    <input
                      v-model="form.format"
                      type="radio"
                      name="format"
                      :value="option.value"
                      @change="touch('format')"
                    />
                    {{ option.label }}
                  </label>
                </div>
                <p v-if="showError('format')" id="cf-format-error" class="field-error">
                  <i class="bi bi-exclamation-circle" aria-hidden="true"></i>{{ allErrors.format }}
                </p>
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
                    :aria-describedby="showError('level') ? 'cf-level-error' : undefined"
                    @blur="touch('level')"
                    @change="touch('level')"
                  >
                    <option value="" disabled>Choose one…</option>
                    <option v-for="option in levelOptions" :key="option" :value="option">{{ option }}</option>
                  </select>
                  <i class="bi bi-chevron-down" aria-hidden="true"></i>
                </div>
                <p v-if="showError('level')" id="cf-level-error" class="field-error">
                  <i class="bi bi-exclamation-circle" aria-hidden="true"></i>{{ allErrors.level }}
                </p>
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
                  placeholder="What would you like to learn, and any questions you have about the course?"
                  :aria-invalid="showError('message') ? 'true' : 'false'"
                  :aria-describedby="showError('message') ? 'cf-message-count cf-message-error' : 'cf-message-count'"
                  @blur="touch('message')"
                ></textarea>
                <p id="cf-message-count" class="field-hint field-count">
                  {{ form.message.length }} / {{ MESSAGE_MAX }}
                </p>
                <p v-if="showError('message')" id="cf-message-error" class="field-error">
                  <i class="bi bi-exclamation-circle" aria-hidden="true"></i>{{ allErrors.message }}
                </p>
              </div>

              <div class="form-submit">
                <button class="btn btn-accent btn-lg" type="submit" :disabled="sending">
                  <span v-if="sending" class="btn-spinner" aria-hidden="true"></span>
                  <i v-else class="bi bi-send" aria-hidden="true"></i>
                  {{ sending ? 'Sending…' : 'Request enrollment' }}
                </button>
                <p class="field-hint" aria-live="polite">
                  <template v-if="sending">Sending your enrollment request…</template>
                  <template v-else-if="apiEnabled">Sent securely to me — used only to reply to your request.</template>
                  <template v-else>Opens your email app — nothing is stored on this site.</template>
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>

      <!-- Instructor + direct contact -->
      <section id="instructor" class="section course-section" aria-labelledby="instructor-title">
        <div class="container course-layout">
          <aside class="tile course-instructor" aria-labelledby="instructor-title">
            <p class="tile-label">Your instructor</p>
            <div class="instructor-head">
              <picture>
                <source :srcset="profileWebp" type="image/webp" />
                <img :src="profileJpg" alt="" width="64" height="64" decoding="async" />
              </picture>
              <div>
                <h2 id="instructor-title" class="instructor-name">Vireak Roeun</h2>
                <p class="tile-note">Senior DevOps Officer &amp; Full-Stack Developer</p>
              </div>
            </div>
            <ul class="instructor-facts" role="list">
              <li v-for="item in instructorFacts" :key="item.text">
                <span class="highlight-icon"><i :class="item.icon" aria-hidden="true"></i></span>
                {{ item.text }}
              </li>
            </ul>
          </aside>

          <aside class="course-aside" aria-labelledby="direct-title">
            <h2 id="direct-title" class="tile-label course-aside-title">Prefer to reach out directly?</h2>
            <a
              v-for="item in directContacts"
              :key="item.label"
              class="tile contact-card"
              :href="item.href"
              v-bind="item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {}"
            >
              <span class="icon-badge"><i :class="item.icon" aria-hidden="true"></i></span>
              <span class="contact-card-body">
                <span class="contact-card-label">{{ item.label }}</span>
                <span class="contact-card-value">{{ item.value }}</span>
                <span class="tile-note">{{ item.note }}</span>
              </span>
              <span class="tile-corner" aria-hidden="true"><i class="bi bi-arrow-up-right"></i></span>
            </a>
            <div class="tile contact-card contact-card-static">
              <span class="icon-badge"><i class="bi bi-geo-alt-fill" aria-hidden="true"></i></span>
              <span class="contact-card-body">
                <span class="contact-card-label">Based in</span>
                <span class="contact-card-value">Phnom Penh, Cambodia</span>
              </span>
            </div>
          </aside>
        </div>
      </section>

      <!-- FAQ -->
      <section id="faq" class="section course-section" aria-labelledby="faq-title">
        <div class="container">
          <SectionHead index="02" eyebrow="FAQ" title="Quick answers" title-id="faq-title" />
          <div class="faq-list">
            <details v-for="item in faqs" :key="item.q" class="tile faq-item">
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
      <a class="btn btn-accent btn-block" href="#enroll">
        <i class="bi bi-mortarboard-fill" aria-hidden="true"></i>
        Enroll now
      </a>
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
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import BrandMark from '@/components/BrandMark.vue';
import SectionHead from '@/components/SectionHead.vue';
import profileWebp from '@/assets/img/profile-520.webp';
import profileJpg from '@/assets/img/profile-520.jpg';

// Contact details: same values as the contact section in HomeView.vue.
const contact = {
  email: 'roeunvireak0@gmail.com',
  telegramUrl: 'https://t.me/R_Vireak',
  telegramHandle: '@R_Vireak'
};

// Course facts: only what the portfolio already states (Projects → "Full-stack teaching course").
const course = {
  title: 'Full-stack teaching course',
  description: '60-hour Laravel + Vue curriculum with a Class Manager capstone, delivered bilingual in English and Khmer.',
  highlights: [
    { label: '60 hours', icon: 'bi bi-clock' },
    { label: 'Laravel + Vue', icon: 'bi bi-stack' },
    { label: 'English & Khmer', icon: 'bi bi-translate' },
    { label: 'Class Manager capstone', icon: 'bi bi-kanban' }
  ]
};

const instructorFacts = [
  { icon: 'bi bi-easel', text: 'Programming Instructor at ANT Training Center (2024 – 2025), teaching PHP, Laravel, MySQL, and OOP' },
  { icon: 'bi bi-hdd-stack', text: 'Builds Laravel, Vue, and Quasar systems in production at the Institute of Banking and Finance' },
  { icon: 'bi bi-translate', text: 'English (professional) · Khmer (native)' }
];

const directContacts = [
  {
    label: 'Email',
    value: contact.email,
    note: 'Best for detailed questions.',
    href: `mailto:${contact.email}?subject=${encodeURIComponent('Course enrollment')}`,
    icon: 'bi bi-envelope-fill',
    external: false
  },
  {
    label: 'Telegram',
    value: contact.telegramHandle,
    note: 'Quick questions and chat.',
    href: contact.telegramUrl,
    icon: 'bi bi-telegram',
    external: true
  }
];

const faqs = [
  { q: 'How long is the course?', a: 'The curriculum is 60 hours in total.' },
  {
    q: 'What will I learn?',
    a: 'Full-stack web development with Laravel on the backend and Vue on the frontend.'
  },
  {
    q: 'What do I build?',
    a: 'A Class Manager capstone project that brings the Laravel and Vue parts of the curriculum together.'
  },
  {
    q: 'Which language is it taught in?',
    a: 'It is taught bilingually in English and Khmer. Let me know your preference in the enrollment form.'
  },
  {
    q: 'Where can I find fees, dates, and schedules?',
    a: 'They aren’t listed on this page. Request a seat or message me on Telegram with your questions.'
  }
];

const languageOptions = [
  { value: 'English', label: 'English' },
  { value: 'Khmer', label: 'Khmer (ខ្មែរ)' }
];

const formatOptions = [
  { value: 'Online', label: 'Online' },
  { value: 'In person', label: 'In person' },
  { value: 'Either', label: 'Either is fine' }
];

const levelOptions = [
  'Complete beginner',
  'Some HTML, CSS, or JavaScript',
  'Some PHP or Laravel',
  'Working developer'
];

const MESSAGE_MAX = 2000;
const FIELD_ORDER = ['name', 'email', 'contact', 'language', 'format', 'level', 'message'];
const FIELD_IDS = {
  name: 'cf-name',
  email: 'cf-email',
  contact: 'cf-contact',
  language: 'cf-language',
  format: 'cf-format',
  level: 'cf-level',
  message: 'cf-message'
};

const form = reactive({
  name: '',
  email: '',
  contact: '',
  language: '',
  format: '',
  level: '',
  message: ''
});

// Optional backend (myportfolio-engine). When unset, the form falls back to mailto.
const API_URL = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
const apiEnabled = Boolean(API_URL);
const LANGUAGE_CODES = { English: 'en', Khmer: 'km' };
const FORMAT_CODES = { Online: 'online', 'In person': 'in_person', Either: 'either' };

const honeypot = ref('');
const sending = ref(false);
const submittedVia = ref('mailto');
const apiMessage = ref('');
const apiError = ref('');
const serverErrors = reactive({});

const touched = reactive({});
const showSummary = ref(false);
const submitted = ref(false);
const copyState = ref('idle');
const successHeading = ref(null);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[\d\s().-]{6,20}$/;
const TELEGRAM_RE = /^(?:@|(?:https?:\/\/)?t\.me\/)?[A-Za-z][A-Za-z0-9_]{4,31}$/;

const errors = computed(() => {
  const result = {};
  const name = form.name.trim();
  const email = form.email.trim();
  const contactValue = form.contact.trim();
  const message = form.message.trim();

  if (!name) {
    result.name = 'Please tell me your name.';
  } else if (name.length < 2) {
    result.name = 'Could you add your full name?';
  }

  if (!email) {
    result.email = 'Please add your email so I can reply.';
  } else if (!EMAIL_RE.test(email)) {
    result.email = 'That email doesn’t look quite right — could you double-check it?';
  }

  if (contactValue) {
    const digits = contactValue.replace(/\D/g, '').length;
    const looksLikePhone = PHONE_RE.test(contactValue) && digits >= 6;
    if (!looksLikePhone && !TELEGRAM_RE.test(contactValue)) {
      result.contact = 'Please enter a phone number or a Telegram username like @username — or leave this empty.';
    }
  }

  if (!form.language) {
    result.language = 'Please choose the language you’d prefer.';
  }

  if (!form.format) {
    result.format = 'Please pick the format you’re interested in.';
  }

  if (!form.level) {
    result.level = 'Please choose the option closest to your experience.';
  }

  if (!message) {
    result.message = 'Please add a short message about what you’d like to learn.';
  } else if (message.length < 10) {
    result.message = 'Could you add a little more detail? A sentence or two is perfect.';
  }

  return result;
});

const allErrors = computed(() => {
  const merged = { ...errors.value };
  for (const [field, message] of Object.entries(serverErrors)) {
    if (message && !merged[field]) merged[field] = message;
  }
  return merged;
});

// A server error on a field disappears once the visitor edits that field.
FIELD_ORDER.forEach((field) => {
  watch(
    () => form[field],
    () => {
      delete serverErrors[field];
    }
  );
});

const errorCount = computed(() => Object.keys(allErrors.value).length);

const showError = (field) => Boolean(allErrors.value[field]) && Boolean(touched[field] || showSummary.value);

const touch = (field) => {
  touched[field] = true;
};

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
    '— Sent from the course enrollment page on roeun-vireak.mxlab.site'
  ];
  return lines.join('\r\n');
});

const mailtoHref = computed(() => {
  const subject = `Course enrollment request – ${form.name.trim() || 'Full-stack teaching course'}`;
  return `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(enquiryText.value)}`;
});

const focusField = (field) => {
  const id = FIELD_IDS[field];
  const el =
    field === 'language' || field === 'format'
      ? document.querySelector(`input[name="${field}"]`)
      : document.getElementById(id);
  el?.focus();
  el?.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
};

const showSuccess = async (via) => {
  submittedVia.value = via;
  submitted.value = true;
  copyState.value = 'idle';
  await nextTick();
  successHeading.value?.focus();
};

const markMailtoFallback = () => {
  showSuccess('mailto');
};

const focusFirstError = async () => {
  const first = FIELD_ORDER.find((field) => allErrors.value[field]);
  await nextTick();
  if (first) focusField(first);
};

const submitToApi = async () => {
  const payload = {
    name: form.name.trim(),
    email: form.email.trim(),
    contact: form.contact.trim() || null,
    language: LANGUAGE_CODES[form.language] ?? form.language,
    format: FORMAT_CODES[form.format] ?? form.format,
    level: form.level,
    message: form.message.trim(),
    website: honeypot.value
  };

  let response;
  try {
    response = await fetch(`${API_URL}/api/course-enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch {
    apiError.value =
      'I couldn’t reach the server — please check your connection and try again, or send your request by email or Telegram.';
    return;
  }

  const data = await response.json().catch(() => ({}));

  if (response.ok) {
    apiMessage.value = typeof data.message === 'string' ? data.message : '';
    await showSuccess('api');
    return;
  }

  if (response.status === 422 && data.errors) {
    for (const [field, messages] of Object.entries(data.errors)) {
      if (FIELD_ORDER.includes(field)) {
        serverErrors[field] = Array.isArray(messages) ? messages[0] : String(messages);
      }
    }
    if (Object.keys(serverErrors).length) {
      showSummary.value = true;
      await focusFirstError();
      return;
    }
  }

  apiError.value =
    response.status === 429
      ? 'You’ve sent a few requests in a row — please wait a minute and try again, or reach me by email or Telegram.'
      : 'Sorry, something went wrong on my side and your request wasn’t sent. Please try again in a moment, or use email or Telegram.';
};

const handleSubmit = async () => {
  if (sending.value) return;
  FIELD_ORDER.forEach(touch);
  showSummary.value = true;
  apiError.value = '';

  if (errorCount.value) {
    await focusFirstError();
    return;
  }

  if (apiEnabled) {
    sending.value = true;
    try {
      await submitToApi();
    } finally {
      sending.value = false;
    }
    return;
  }

  submittedVia.value = 'mailto';
  submitted.value = true;
  copyState.value = 'idle';
  await nextTick();
  successHeading.value?.focus();
  window.location.href = mailtoHref.value;
};

const copyEnquiry = async () => {
  try {
    await navigator.clipboard.writeText(enquiryText.value);
    copyState.value = 'copied';
  } catch {
    copyState.value = 'failed';
  }
};

const startNewEnquiry = async () => {
  Object.assign(form, { name: '', email: '', contact: '', language: '', format: '', level: '', message: '' });
  Object.keys(touched).forEach((key) => delete touched[key]);
  Object.keys(serverErrors).forEach((key) => delete serverErrors[key]);
  apiMessage.value = '';
  await editEnquiry();
};

const editEnquiry = async () => {
  submitted.value = false;
  showSummary.value = false;
  await nextTick();
  document.getElementById('cf-name')?.focus();
};

const currentYear = new Date().getFullYear();
const isScrolled = ref(false);
const handleScroll = () => {
  isScrolled.value = window.scrollY > 8;
};

// Sticky mobile "Enroll now" bar hides while the form is on screen.
const enrollEl = ref(null);
const enrollInView = ref(false);
let enrollObserver;

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
  if ('IntersectionObserver' in window && enrollEl.value) {
    enrollObserver = new IntersectionObserver(([entry]) => {
      enrollInView.value = entry.isIntersecting;
    }, { threshold: 0.1 });
    enrollObserver.observe(enrollEl.value);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
  enrollObserver?.disconnect();
});
</script>
