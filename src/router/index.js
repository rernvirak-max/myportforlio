import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { routeMeta } from './meta.js'
import { getToken } from '../admin/api.js'

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
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('../views/admin/AdminLoginView.vue'),
      meta: routeMeta.adminLogin,
    },
    {
      path: '/admin',
      component: () => import('../views/admin/AdminLayout.vue'),
      meta: { requiresAdmin: true, noindex: true },
      children: [
        { path: '', redirect: { name: 'admin-overview' } },
        {
          path: 'overview',
          name: 'admin-overview',
          component: () => import('../views/admin/AdminOverviewView.vue'),
          meta: { ...routeMeta.adminOverview, requiresAdmin: true },
        },
        {
          path: 'enrollments',
          name: 'admin-enrollments',
          component: () => import('../views/admin/AdminEnrollmentsView.vue'),
          meta: { ...routeMeta.adminEnrollments, requiresAdmin: true },
        },
        {
          path: 'courses',
          name: 'admin-courses',
          component: () => import('../views/admin/AdminCoursesView.vue'),
          meta: { ...routeMeta.adminCourses, requiresAdmin: true },
        },
        {
          path: 'students',
          name: 'admin-students',
          component: () => import('../views/admin/AdminPlaceholderView.vue'),
          props: {
            title: 'Students',
            blurb: 'Student roster and payment tracking will live here.',
          },
          meta: { ...routeMeta.adminStudents, requiresAdmin: true },
        },
        {
          path: 'content',
          name: 'admin-content',
          component: () => import('../views/admin/AdminPlaceholderView.vue'),
          props: {
            title: 'Content',
            blurb: 'Edit portfolio projects, skills, and testimonials without a code deploy.',
          },
          meta: { ...routeMeta.adminContent, requiresAdmin: true },
        },
        {
          path: 'settings',
          name: 'admin-settings',
          component: () => import('../views/admin/AdminPlaceholderView.vue'),
          props: {
            title: 'Settings',
            blurb: 'Password, sessions, and notification preferences come next.',
          },
          meta: { ...routeMeta.adminSettings, requiresAdmin: true },
        },
      ],
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.name === from.name) {
      return false
    }
    if (to.hash) {
      return { el: to.hash, top: 80, behavior: 'instant' }
    }
    return { top: 0, behavior: 'instant' }
  },
})

router.beforeEach((to) => {
  if (to.meta.requiresAdmin && !getToken()) {
    return {
      name: 'admin-login',
      query: to.fullPath !== '/admin' && to.fullPath !== '/admin/' ? { next: to.fullPath } : {},
    }
  }
  if (to.name === 'admin-login' && getToken()) {
    return { name: 'admin-overview' }
  }
})

const setRobots = (noindex) => {
  let el = document.head.querySelector('meta[name="robots"]')
  if (noindex) {
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute('name', 'robots')
      document.head.appendChild(el)
    }
    el.setAttribute('content', 'noindex, nofollow')
  } else if (el) {
    el.remove()
  }
}

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
  setRobots(meta.noindex)
  setMeta('meta[name="description"]', 'content', meta.description)
  setMeta('meta[property="og:title"]', 'content', meta.title)
  setMeta('meta[property="og:description"]', 'content', meta.description)
  setMeta('meta[property="og:url"]', 'content', meta.canonical)
  setMeta('meta[name="twitter:title"]', 'content', meta.title)
  setMeta('meta[name="twitter:description"]', 'content', meta.description)
  setMeta('link[rel="canonical"]', 'href', meta.canonical)
})

export default router
