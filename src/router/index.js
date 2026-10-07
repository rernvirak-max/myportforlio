import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { routeMeta } from './meta.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: routeMeta.home,
    },
    {
      path: '/course',
      name: 'course',
      component: () => import('../views/CourseView.vue'),
      meta: routeMeta.course,
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    // Same-page hash links are handled natively by the browser (CSS scroll-padding).
    if (to.name === from.name) {
      return false
    }
    // 'instant' so the global CSS `scroll-behavior: smooth` doesn't animate page changes.
    if (to.hash) {
      return { el: to.hash, top: 80, behavior: 'instant' }
    }
    return { top: 0, behavior: 'instant' }
  },
})

const setMeta = (selector, attr, value) => {
  const el = document.head.querySelector(selector)
  if (el) {
    el.setAttribute(attr, value)
  }
}

router.afterEach((to) => {
  const meta = to.meta
  if (!meta?.title) {
    return
  }
  document.title = meta.title
  setMeta('meta[name="description"]', 'content', meta.description)
  setMeta('meta[property="og:title"]', 'content', meta.title)
  setMeta('meta[property="og:description"]', 'content', meta.description)
  setMeta('meta[property="og:url"]', 'content', meta.canonical)
  setMeta('meta[name="twitter:title"]', 'content', meta.title)
  setMeta('meta[name="twitter:description"]', 'content', meta.description)
  setMeta('link[rel="canonical"]', 'href', meta.canonical)
})

export default router
