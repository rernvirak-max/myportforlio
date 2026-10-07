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
  course: {
    title: 'Full-stack teaching course enquiry | Vireak Roeun',
    description:
      'Enquire about Vireak Roeun’s 60-hour Laravel + Vue full-stack course with a Class Manager capstone, taught in English and Khmer.',
    canonical: `${SITE_URL}/course/`
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
