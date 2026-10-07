<template>
  <div class="page course-page courses-catalog">
    <a class="skip-link" href="#main">Skip to content</a>
    <CourseHeader>
      <a class="btn btn-accent btn-sm" :href="contact.telegramUrl" target="_blank" rel="noopener noreferrer">
        <i class="bi bi-telegram" aria-hidden="true"></i>
        <span class="hide-xs">Ask on</span> Telegram
      </a>
    </CourseHeader>

    <main id="main" class="container course-main">
      <!-- Intro bento -->
      <section class="course-bento" aria-labelledby="catalog-title">
        <div class="tile tile-intro course-intro">
          <p class="eyebrow eyebrow-accent"><i class="bi bi-mortarboard-fill" aria-hidden="true"></i> Courses by Vireak Roeun</p>
          <h1 id="catalog-title" class="course-h1">Learn to build and ship real software.</h1>
          <p class="hero-tagline">
            Small-group classes in English and Khmer, taught by a working Full-Stack Developer &amp; Senior DevOps Officer.
          </p>
          <div class="hero-actions">
            <a class="btn btn-accent btn-lg" href="#catalog">
              See the courses
              <i class="bi bi-arrow-down" aria-hidden="true"></i>
            </a>
            <a class="btn btn-ghost btn-lg" href="#how-it-works">How classes open</a>
          </div>
        </div>
        <div class="tile tile-photo course-photo">
          <picture>
            <source :srcset="profileWebp" type="image/webp" />
            <img :src="profileJpg" alt="Vireak Roeun, course instructor" width="520" height="520" decoding="async" />
          </picture>
        </div>
        <div class="tile course-fact">
          <p class="tile-label"><i class="bi bi-translate" aria-hidden="true"></i> Taught in</p>
          <p class="course-fact-value">English &amp; Khmer</p>
        </div>
        <div class="tile course-fact course-fact-accent">
          <p class="tile-label"><i class="bi bi-people" aria-hidden="true"></i> Class size</p>
          <p class="course-fact-value">Opens at {{ MIN_STUDENTS }} students</p>
        </div>
      </section>

      <!-- Course cards -->
      <section id="catalog" class="course-block" aria-labelledby="catalog-list-title">
        <div class="block-head">
          <p class="tile-label">Courses</p>
          <h2 id="catalog-list-title">Pick your track</h2>
        </div>
        <div class="course-cards">
          <article v-for="c in courses" :key="c.slug" class="tile course-card">
            <div class="course-card-top">
              <span class="course-card-icon" aria-hidden="true"><i :class="c.icon"></i></span>
              <span class="status-pill" :class="`is-${status(c).tone}`">
                <span class="status-dot" aria-hidden="true"></span>{{ status(c).text }}
              </span>
            </div>
            <h3 class="course-card-title">{{ c.title }}</h3>
            <p class="tile-note">{{ c.summary }}</p>
            <dl class="course-specs">
              <div><dt>Hours</dt><dd>{{ c.hours ? `${c.hours} h` : 'To be announced' }}</dd></div>
              <div><dt>Languages</dt><dd>{{ c.languages?.join(' & ') || '—' }}</dd></div>
              <div><dt>Level</dt><dd>{{ c.level || 'To be announced' }}</dd></div>
              <div><dt>Price</dt><dd>{{ priceText(c) }}</dd></div>
            </dl>
            <div>
              <p class="course-sub">{{ c.outlinePending ? 'What it covers' : 'You will' }}</p>
              <ul class="check-list" role="list">
                <li v-for="o in c.outcomes" :key="o"><i class="bi bi-check2" aria-hidden="true"></i>{{ o }}</li>
              </ul>
            </div>
            <ul class="course-chips" role="list" aria-label="Stack">
              <li v-for="t in c.stack" :key="t" class="course-chip">{{ t }}</li>
            </ul>
            <div class="course-card-actions">
              <router-link class="btn btn-ghost" :to="`/courses/${c.slug}`">View course</router-link>
              <router-link class="btn btn-accent" :to="`/courses/${c.slug}#enroll`">
                Enroll
                <i class="bi bi-arrow-right" aria-hidden="true"></i>
              </router-link>
            </div>
          </article>
        </div>
      </section>

      <div id="how-it-works" class="course-block">
        <CoursePolicyTile />
      </div>

      <section class="course-block course-help-grid" aria-label="Questions">
        <div class="tile course-help">
          <p class="tile-label"><i class="bi bi-chat-dots" aria-hidden="true"></i> Not sure which one?</p>
          <h2 class="course-help-title">Message me and I’ll help you choose.</h2>
          <div class="hero-actions">
            <a class="btn btn-accent" :href="contact.telegramUrl" target="_blank" rel="noopener noreferrer">
              <i class="bi bi-telegram" aria-hidden="true"></i> Telegram {{ contact.telegramHandle }}
            </a>
            <a class="btn btn-ghost" :href="`mailto:${contact.email}?subject=${encodeURIComponent('Course question')}`">
              <i class="bi bi-envelope" aria-hidden="true"></i> Email
            </a>
          </div>
        </div>
      </section>
    </main>

    <CourseFooter />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import CourseHeader from '@/components/CourseHeader.vue'
import CourseFooter from '@/components/CourseFooter.vue'
import CoursePolicyTile from '@/components/CoursePolicyTile.vue'
import { apiConfigured, engineAPI } from '@/helpers/api'
import { MIN_STUDENTS, contact, coursePrice, loadCourses, mergeCourse, nextClassStatus, staticCourses } from '@/data/courses.js'
import profileWebp from '@/assets/img/profile-520.webp'
import profileJpg from '@/assets/img/profile-520.jpg'

const courses = ref(staticCourses.map((c) => mergeCourse(null, c)))
const status = (c) => nextClassStatus(c)
const priceText = (c) => {
  const p = coursePrice(c)
  return p ? `${p.from ? 'From ' : ''}${p.label}` : 'Price on request'
}

onMounted(async () => {
  courses.value = await loadCourses(engineAPI, apiConfigured)
})
</script>
