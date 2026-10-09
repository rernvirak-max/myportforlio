<template>
  <div class="page course-page course-detail">
    <a class="skip-link" href="#main">Skip to content</a>
    <CourseHeader :back="{ to: '/courses', label: 'All courses' }">
      <button class="btn btn-accent btn-sm" type="button" @click="goEnroll()">Enroll</button>
    </CourseHeader>

    <main id="main" class="container course-main">
      <section v-if="notFound" class="tile course-notfound" aria-labelledby="nf-title">
        <p class="tile-label">Course not found</p>
        <h1 id="nf-title" class="course-h1">That course isn’t available.</h1>
        <p class="tile-note">It may have been renamed or unpublished.</p>
        <div class="hero-actions"><router-link class="btn btn-accent" to="/courses">Browse courses</router-link></div>
      </section>

      <template v-else>
        <!-- Hero bento -->
        <section class="course-bento course-bento-detail" aria-labelledby="course-title">
          <div class="tile tile-intro course-intro">
            <p class="eyebrow eyebrow-accent"><i :class="course.icon" aria-hidden="true"></i> {{ course.shortTitle || 'Course' }} course</p>
            <h1 id="course-title" class="course-h1">{{ course.title }}</h1>
            <p class="hero-tagline">{{ course.summary }}</p>
            <div class="hero-actions">
              <button class="btn btn-accent btn-lg" type="button" @click="goEnroll()">
                Request a seat
                <i class="bi bi-arrow-right" aria-hidden="true"></i>
              </button>
              <a class="btn btn-ghost btn-lg" :href="contact.telegramUrl" target="_blank" rel="noopener noreferrer">
                <i class="bi bi-telegram" aria-hidden="true"></i> Ask on Telegram
              </a>
            </div>
          </div>
          <div class="tile tile-photo course-photo">
            <picture>
              <source :srcset="profileWebp" type="image/webp" />
              <img :src="profileJpg" alt="Vireak Roeun, course instructor" width="520" height="520" decoding="async" />
            </picture>
          </div>
          <div class="tile course-fact">
            <p class="tile-label"><i class="bi bi-clock" aria-hidden="true"></i> Length</p>
            <p class="course-fact-value">{{ course.hours ? `${course.hours} hours` : 'To be announced' }}</p>
          </div>
          <div class="tile course-fact">
            <p class="tile-label"><i class="bi bi-translate" aria-hidden="true"></i> Languages</p>
            <p class="course-fact-value">{{ course.languages?.join(' & ') }}</p>
          </div>
          <div class="tile course-fact">
            <p class="tile-label"><i class="bi bi-bar-chart" aria-hidden="true"></i> Level</p>
            <p class="course-fact-value">{{ course.level || 'To be announced' }}</p>
          </div>
          <div class="tile course-fact course-fact-accent">
            <p class="tile-label"><i class="bi bi-tag" aria-hidden="true"></i> Price</p>
            <p class="course-fact-value">
              <template v-if="pricing">
                {{ pricing.from ? 'From ' : '' }}{{ pricing.label }}<s v-if="pricing.was" class="price-was"><span class="visually-hidden">Regular price </span>{{ pricing.was }}</s>
                <span v-if="pricing.monthly" class="price-monthly">or {{ pricing.monthly }}</span>
              </template>
              <template v-else>Price on request</template>
            </p>
          </div>
        </section>

        <!-- Ways to pay (only when the next open class has payment options turned on) -->
        <div v-if="payCohort && paymentOptions(payCohort).any" class="course-block">
          <WaysToPayTile :course="course" :cohort="payCohort" @enroll="goEnroll" />
        </div>

        <!-- Outline + classes -->
        <div class="course-split course-block">
          <section id="outline" class="tile course-panel" aria-labelledby="outline-title">
            <p class="tile-label">Curriculum</p>
            <h2 id="outline-title" class="panel-title">{{ course.outlinePending ? 'What it covers' : 'Course outline' }}</h2>
            <ol v-if="!course.outlinePending" class="outline-list">
              <li v-for="(m, i) in course.modules" :key="m.id || i" class="outline-item">
                <span class="outline-index">{{ String(i + 1).padStart(2, '0') }}</span>
                <div class="outline-body">
                  <h3>{{ m.title }}</h3>
                  <p v-if="m.description">{{ m.description }}</p>
                </div>
                <span v-if="m.hours" class="outline-hours">{{ m.hours }}h</span>
              </li>
            </ol>
            <template v-else>
              <ul class="check-list" role="list">
                <li v-for="o in course.outcomes" :key="o"><i class="bi bi-check2" aria-hidden="true"></i>{{ o }}</li>
              </ul>
              <ul class="course-chips" role="list" aria-label="Stack">
                <li v-for="t in course.stack" :key="t" class="course-chip">{{ t }}</li>
              </ul>
              <p class="outline-pending"><i class="bi bi-hourglass-split" aria-hidden="true"></i> Full outline coming soon — request a seat and I’ll send it as soon as it’s ready.</p>
            </template>
          </section>

          <section id="classes" class="tile course-panel" aria-labelledby="classes-title">
            <p class="tile-label">Upcoming classes</p>
            <h2 id="classes-title" class="panel-title">Pick a class</h2>
            <ul v-if="cohorts.length" class="cohort-list" role="list">
              <li v-for="c in cohorts" :key="c.id" class="cohort-card" :class="{ 'is-closed': c.status !== 'open' }">
                <div class="cohort-head">
                  <h3>{{ c.title }}</h3>
                  <span class="status-pill" :class="c.status === 'open' ? 'is-live' : 'is-muted'">
                    <span class="status-dot" aria-hidden="true"></span>{{ formatLabel(c.status) }}
                  </span>
                </div>
                <p class="cohort-meta">
                  {{ formatCohortDates(c) }}<template v-if="c.schedule_text"> · {{ c.schedule_text }}</template>
                  <template v-if="c.format"> · {{ formatLabel(c.format) }}</template>
                  <template v-if="cohortPrice(c)"> · {{ cohortPriceNow(c).label }}<s v-if="cohortPriceNow(c).was" class="price-was"><span class="visually-hidden">Regular price </span>{{ cohortPriceNow(c).was }}</s></template>
                </p>
                <ul v-if="c.status === 'open' && paymentPills(c).some((p) => !p.muted)" class="cohort-pay" aria-label="Payment options">
                  <li v-for="p in paymentPills(c).filter((x) => !x.muted)" :key="p.key"><i class="bi" :class="p.icon" aria-hidden="true"></i>{{ p.label }}</li>
                </ul>
                <CohortProgress :course="course" :cohort="c" />
                <button v-if="c.status === 'open'" class="btn btn-accent btn-sm" type="button" @click="goEnroll(c)">Request a seat</button>
              </li>
            </ul>
            <div v-else class="cohort-empty">
              <p><strong>Next class is forming.</strong></p>
              <p class="tile-note">No dates are published yet. Request a seat and I’ll contact you as soon as {{ MIN_STUDENTS }} students have joined.</p>
            </div>
          </section>
        </div>

        <div class="course-block"><CoursePolicyTile /></div>

        <!-- Instructor + FAQ -->
        <div class="course-split course-block">
          <section class="tile course-panel course-instructor" aria-labelledby="instructor-title">
            <picture class="course-instructor-photo">
              <source :srcset="profileWebp" type="image/webp" />
              <img :src="profileJpg" alt="Vireak Roeun" width="520" height="520" decoding="async" loading="lazy" />
            </picture>
            <p class="tile-label">Your instructor</p>
            <h2 id="instructor-title" class="panel-title">Vireak Roeun</h2>
            <p class="tile-note">Senior DevOps Officer &amp; Full-Stack Developer</p>
            <ul class="check-list" role="list">
              <li v-for="item in instructorFacts" :key="item.text"><i :class="item.icon" aria-hidden="true"></i>{{ item.text }}</li>
            </ul>
          </section>

          <section id="faq" class="tile course-panel" aria-labelledby="faq-title">
            <p class="tile-label">FAQ</p>
            <h2 id="faq-title" class="panel-title">Quick answers</h2>
            <div class="faq-list faq-list-single">
              <details v-for="item in faqs" :key="item.q" class="faq-item">
                <summary>
                  {{ item.q }}
                  <i class="bi bi-plus-lg" aria-hidden="true"></i>
                </summary>
                <p>{{ item.a }}</p>
              </details>
            </div>
          </section>
        </div>
      </template>
    </main>

    <div v-if="!notFound" class="enroll-bar" :class="{ 'is-hidden': enrollOpen }" :inert="enrollOpen">
      <button class="btn btn-accent btn-block" type="button" @click="goEnroll()">
        <i class="bi bi-mortarboard-fill" aria-hidden="true"></i>
        Request a seat
      </button>
    </div>

    <Teleport to="body">
      <div
        v-if="enrollOpen && !notFound"
        class="enroll-dialog-scrim"
        @click.self="closeEnroll"
      >
        <div
          id="enroll"
          class="enroll-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="enroll-title"
        >
          <header class="enroll-dialog-head">
            <div>
              <p class="tile-label">Enroll</p>
              <h2 id="enroll-title" class="panel-title">Request your seat</h2>
            </div>
            <button class="enroll-dialog-close" type="button" aria-label="Close" @click="closeEnroll">
              <i class="bi bi-x-lg" aria-hidden="true"></i>
            </button>
          </header>

          <div class="enroll-dialog-body">
            <p class="tile-note enroll-dialog-lead">
              Tell me a little about yourself.
              <template v-if="apiEnabled"> Your request comes straight to me and I’ll reply by email or Telegram.</template>
              <template v-else> Submitting opens your email app with everything filled in.</template>
            </p>
            <ul class="enroll-facts" role="list">
              <li><i class="bi bi-people" aria-hidden="true"></i> Classes open at {{ MIN_STUDENTS }} students</li>
              <li><i class="bi bi-chat-dots" aria-hidden="true"></i> I’ll contact you to confirm before the class starts</li>
              <li><i class="bi bi-translate" aria-hidden="true"></i> English or Khmer — your choice</li>
            </ul>
            <p class="tile-note enroll-alt">
              Prefer chat? <a :href="contact.telegramUrl" target="_blank" rel="noopener noreferrer">Telegram {{ contact.telegramHandle }}</a>
              · <a :href="`mailto:${contact.email}`">{{ contact.email }}</a>
            </p>

            <div class="course-enroll-panel">
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
                  <div class="field">
                    <label class="field-label" for="cf-course">Course</label>
                    <div class="select-wrap">
                      <select id="cf-course" v-model="formCourseSlug" class="input" name="course">
                        <option v-for="c in allCourses" :key="c.slug" :value="c.slug">{{ c.title }}</option>
                      </select>
                      <i class="bi bi-chevron-down" aria-hidden="true"></i>
                    </div>
                  </div>
                  <div class="field">
                    <label class="field-label" for="cf-cohort">Class</label>
                    <div class="select-wrap">
                      <select id="cf-cohort" v-model="formCohortId" class="input" name="cohort" :disabled="!formCohorts.length">
                        <option :value="null">{{ formCohorts.length ? 'Next available class' : 'Next class (forming)' }}</option>
                        <option v-for="c in formCohorts" :key="c.id" :value="c.id" :disabled="c.status !== 'open'">
                          {{ c.title }} · {{ formatCohortDates(c) }}{{ c.status !== 'open' ? ` (${c.status})` : '' }}
                        </option>
                      </select>
                      <i class="bi bi-chevron-down" aria-hidden="true"></i>
                    </div>
                  </div>
                </div>

                <div class="form-row">
                  <div class="field" :class="{ 'has-error': showError('name') }">
                    <label class="field-label" for="cf-name">Your name</label>
                    <input
                      id="cf-name"
                      ref="nameInput"
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

                <div v-if="referralOffered" class="field">
                  <label class="field-label" for="cf-referral">
                    Referred by <span class="field-optional">(optional)</span>
                  </label>
                  <input
                    id="cf-referral"
                    v-model="form.referredBy"
                    class="input"
                    type="text"
                    name="referred_by"
                    autocomplete="off"
                    maxlength="80"
                    placeholder="Your friend’s name or phone"
                  />
                  <p class="field-hint">Came with a friend? Add their name and you both get the friend discount.</p>
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
                    rows="4"
                    :maxlength="messageMax"
                    placeholder="What would you like to learn?"
                    :aria-invalid="showError('message') ? 'true' : 'false'"
                    @blur="touch('message')"
                  />
                  <p class="field-hint field-count">{{ form.message.length }} / {{ messageMax }}</p>
                  <p v-if="showError('message')" class="field-error">{{ allErrors.message }}</p>
                </div>

                <p class="form-policy"><i class="bi bi-people" aria-hidden="true"></i> Classes open at {{ MIN_STUDENTS }} students. I’ll contact you to confirm before the class starts.</p>
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
        </div>
      </div>
    </Teleport>

    <CourseFooter />
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import CourseHeader from '@/components/CourseHeader.vue'
import CourseFooter from '@/components/CourseFooter.vue'
import CoursePolicyTile from '@/components/CoursePolicyTile.vue'
import CohortProgress from '@/components/CohortProgress.vue'
import WaysToPayTile from '@/components/WaysToPayTile.vue'
import { formatMoney, paymentPills } from '@/data/paymentOptions.js'
import { apiConfigured as apiEnabled, engineAPI, ApiError } from '@/helpers/api'
import {
  MIN_STUDENTS, contact, cohortPrice, coursePriceText, coursePricing, formatCohortDates, formatLabel,
  loadCourses, mergeCourse, nextOpenCohort, paymentOptions, staticBySlug, staticCourses, visibleCohorts,
} from '@/data/courses.js'
import profileWebp from '@/assets/img/profile-520.webp'
import profileJpg from '@/assets/img/profile-520.jpg'

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))

const course = ref(mergeCourse(null, staticBySlug[slug.value] || staticCourses[0]))
const notFound = ref(false)
const allCourses = ref(staticCourses.map((c) => mergeCourse(null, c)))

const cohorts = computed(() => visibleCohorts(course.value))
const pricing = computed(() => coursePricing(course.value))
const priceText = computed(() => coursePriceText(course.value))
const payCohort = computed(() => nextOpenCohort(course.value))
/** Class price right now: early-bird price with the regular one struck through while it runs. */
const cohortPriceNow = (c) => {
  const o = paymentOptions(c)
  return o.earlyBird
    ? { label: formatMoney(o.effectivePrice, o.currency), was: formatMoney(o.price, o.currency) }
    : { label: cohortPrice(c), was: null }
}

// Enrollment target (course preselected from the page, switchable in the form)
const formCourseSlug = ref(slug.value)
const formCohortId = ref(null)
const formCourse = computed(
  () => (formCourseSlug.value === course.value.slug ? course.value : allCourses.value.find((c) => c.slug === formCourseSlug.value)) || course.value,
)
const formCohorts = computed(() => visibleCohorts(formCourse.value))
const formCohort = computed(() => formCohorts.value.find((c) => c.id === formCohortId.value) || null)
watch(formCourseSlug, () => {
  if (!formCohorts.value.some((c) => c.id === formCohortId.value)) formCohortId.value = null
})

const loadCourse = async () => {
  const fallback = staticBySlug[slug.value]
  notFound.value = false
  course.value = mergeCourse(null, fallback || null)
  formCourseSlug.value = slug.value
  formCohortId.value = null
  if (!apiEnabled) {
    notFound.value = !fallback
    return
  }
  try {
    const { data } = await engineAPI.get(`/courses/${encodeURIComponent(slug.value)}`)
    course.value = mergeCourse(data?.data || data, fallback || null)
  } catch (e) {
    // 404 for a course we don't know statically → not found; anything else keeps the static fallback.
    if (!fallback) notFound.value = true
    void e
  }
}

const enrollOpen = ref(false)
const nameInput = ref(null)
let previousOverflow = ''

const setEnrollHash = (open) => {
  const url = new URL(window.location.href)
  if (open) url.hash = 'enroll'
  else url.hash = ''
  history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
}

const closeEnroll = () => {
  enrollOpen.value = false
  setEnrollHash(false)
}

const goEnroll = async (cohort = null) => {
  if (cohort) {
    formCourseSlug.value = course.value.slug
    formCohortId.value = cohort.id
  }
  enrollOpen.value = true
  setEnrollHash(true)
  await nextTick()
  window.setTimeout(() => {
    ;(nameInput.value || document.getElementById('cf-name'))?.focus({ preventScroll: true })
  }, 50)
}

const onEnrollKey = (e) => {
  if (e.key === 'Escape' && enrollOpen.value) closeEnroll()
}

watch(enrollOpen, (open) => {
  if (open) {
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onEnrollKey)
  } else {
    document.body.style.overflow = previousOverflow
    document.removeEventListener('keydown', onEnrollKey)
  }
})

const instructorFacts = [
  { icon: 'bi bi-easel', text: 'Programming Instructor at ANT Training Center (2024 – 2025), teaching PHP, Laravel, MySQL, and OOP' },
  { icon: 'bi bi-hdd-stack', text: 'Builds Laravel, Vue, and Quasar systems in production at the Institute of Banking and Finance' },
  { icon: 'bi bi-hdd-network', text: 'Delivered VPS, Coolify, domain/SSL, and CI/CD setups for clients' },
  { icon: 'bi bi-translate', text: 'English (professional) · Khmer (native)' },
]

const faqs = computed(() => {
  const c = course.value
  const list = []
  if (c.hours) list.push({ q: 'How long is the course?', a: `The curriculum is ${c.hours} hours in total.` })
  else list.push({ q: 'How long is the course?', a: 'Hours and schedule will be announced with the first class. Request a seat to hear first.' })
  if (c.slug === 'full-stack-teaching-course') {
    list.push({ q: 'What do I build?', a: 'A Class Manager capstone that brings the Laravel and Vue parts of the curriculum together.' })
  } else {
    list.push({ q: 'What does it cover?', a: `${c.stack.join(', ')}. The full outline is coming soon.` })
  }
  list.push(
    { q: 'When does a class start?', a: `A class opens once at least ${MIN_STUDENTS} students have enrolled. I’ll contact you to confirm before the class starts.` },
    { q: 'Which language is it taught in?', a: 'English and Khmer. Tell me your preference in the enrollment form.' },
    { q: 'How much does it cost?', a: priceText.value === 'Price on request' ? 'Price on request — send a seat request or message me on Telegram and I’ll share the current fee.' : `Classes currently start at ${priceText.value}. Details are confirmed before the class starts.` },
  )
  return list
})

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
  referredBy: '',
})

// Refer-a-friend: only asked when a class of the chosen course offers it. Sent inside the
// existing `message` text as a "[Referred by: …]" prefix — no new payload key.
const referralOffered = computed(() => {
  const list = formCohort.value ? [formCohort.value] : formCohorts.value.filter((c) => c.status === 'open')
  return list.some((c) => paymentOptions(c).referral)
})
const referralTag = computed(() => {
  const who = form.referredBy.trim().replace(/[[\]]/g, '')
  return referralOffered.value && who ? `[Referred by: ${who}] ` : ''
})
const messagePrefix = computed(() => (formCourse.value?.id ? '' : `[${formCourse.value?.title || 'Course'}] `) + referralTag.value)
const composedMessage = computed(() => `${messagePrefix.value}${form.message.trim()}`)
const messageMax = computed(() => MESSAGE_MAX - messagePrefix.value.length)

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
  else if (message.length > messageMax.value) result.message = `Please keep your message under ${messageMax.value} characters.`

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
    `I'd like to enroll in your ${formCourse.value?.title || 'course'}.`,
    '',
    `Class: ${formCohort.value ? `${formCohort.value.title} (${formatCohortDates(formCohort.value)})` : 'Next available'}`,
    `Name: ${form.name.trim()}`,
    `Email: ${form.email.trim()}`,
    `Phone / Telegram: ${form.contact.trim() || 'Not provided'}`,
    ...(referralTag.value ? [`Referred by: ${form.referredBy.trim()}`] : []),
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
  const subject = `Course enrollment request – ${form.name.trim() || formCourse.value?.title || 'course'}`
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
    message: composedMessage.value,
    website: honeypot.value,
    course_id: formCourse.value?.id || null,
    cohort_id: formCohortId.value || null,
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
  Object.assign(form, { name: '', email: '', contact: '', language: '', format: '', level: '', message: '', referredBy: '' })
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
watch(slug, async () => {
  closeEnroll()
  await loadCourse()
})

onMounted(async () => {
  allCourses.value = staticCourses.map((c) => mergeCourse(null, c))
  if (window.location.hash === '#enroll') window.setTimeout(() => goEnroll(), 150)
  await loadCourse()
  loadCourses(engineAPI, apiEnabled).then((list) => { allCourses.value = list })
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onEnrollKey)
  if (enrollOpen.value) document.body.style.overflow = previousOverflow
})
</script>
