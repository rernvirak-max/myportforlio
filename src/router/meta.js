// Per-route <title> / description / canonical. Plain JS (no Vue imports) so vite.config.js
// can reuse it to bake the same tags into dist/course/index.html at build time.
// Home must match the defaults in index.html.
export const SITE_URL = 'https://roeun-vireak.mxlab.site'

const adminMeta = (title, path) => ({
  title: `${title} | Admin`,
  description: 'Private admin area.',
  canonical: `${SITE_URL}${path}`,
  noindex: true,
  adminTitle: title,
})

export const routeMeta = {
  home: {
    title: 'Vireak Roeun | Full-Stack Developer & DevOps Engineer',
    description:
      'Vireak Roeun - Senior DevOps Officer and Full-Stack Developer building scalable systems with Laravel, Vue, Docker, and AWS.',
    canonical: `${SITE_URL}/`
  },
  courses: {
    title: 'Courses: Full-Stack & DevOps | Vireak Roeun',
    description:
      'Small-group Full-Stack (Laravel + Vue) and DevOps courses by Vireak Roeun, taught in English and Khmer. Classes open at 4 students.',
    canonical: `${SITE_URL}/courses/`
  },
  courseDetail: {
    title: 'Course | Vireak Roeun',
    description: 'Course details, upcoming classes, and enrollment.',
    canonical: `${SITE_URL}/courses/`
  },
  // Legacy /course → redirects client-side; static page keeps old links/previews working.
  course: {
    title: 'Full-stack teaching course | Vireak Roeun',
    description:
      '60-hour Laravel + Vue full-stack course with a Class Manager capstone, taught in English and Khmer. Classes open at 4 students.',
    canonical: `${SITE_URL}/courses/full-stack-teaching-course/`
  },
  // Private admin pages: noindex, not linked, not in sitemap.xml.
  adminLogin: {
    title: 'Admin sign in | Vireak Roeun',
    description: 'Private admin area.',
    canonical: `${SITE_URL}/admin/login/`,
    noindex: true
  },
  admin: adminMeta('Admin', '/admin/'),
  adminOverview: adminMeta('Overview', '/admin/overview/'),
  adminEnrollments: adminMeta('Enrollments', '/admin/enrollments/'),
  adminCourses: adminMeta('Courses & Classes', '/admin/courses/'),
  adminStudents: adminMeta('Students', '/admin/students/'),
  adminContent: adminMeta('Content', '/admin/content/'),
  adminSettings: adminMeta('Settings', '/admin/settings/'),
}

// Public course detail pages known at build time (baked into dist/courses/<slug>/index.html).
export const courseMetaBySlug = {
  'full-stack-teaching-course': {
    title: 'Full-stack teaching course (Laravel + Vue) | Vireak Roeun',
    description:
      '60-hour Laravel + Vue course with a Class Manager capstone, taught in English and Khmer. Request a seat — classes open at 4 students.',
    canonical: `${SITE_URL}/courses/full-stack-teaching-course/`
  },
  'devops-course': {
    title: 'DevOps course (Docker, CI/CD, Coolify, AWS) | Vireak Roeun',
    description:
      'DevOps course by Vireak Roeun covering Docker, CI/CD, Coolify, Nixpacks, AWS, and Linux servers. Request a seat — classes open at 4 students.',
    canonical: `${SITE_URL}/courses/devops-course/`
  },
}
