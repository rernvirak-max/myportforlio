import { fileURLToPath, URL } from 'node:url'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { routeMeta } from './src/router/meta.js'

// The host serves dist/ as plain static files (no SPA rewrites). For every extra route we
// write dist/<route>/index.html — a copy of the built index.html with that route's title,
// description and canonical/Open Graph URLs — so direct visits and refreshes work and
// link previews show the right text.
const staticRoutes = [
  { path: 'course', meta: routeMeta.course },
  { path: 'admin', meta: routeMeta.adminOverview },
  { path: 'admin/login', meta: routeMeta.adminLogin },
  { path: 'admin/overview', meta: routeMeta.adminOverview },
  { path: 'admin/enrollments', meta: routeMeta.adminEnrollments },
  { path: 'admin/courses', meta: routeMeta.adminCourses },
  { path: 'admin/students', meta: routeMeta.adminStudents },
  { path: 'admin/content', meta: routeMeta.adminContent },
  { path: 'admin/settings', meta: routeMeta.adminSettings },
]

const escapeAttr = (value) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function staticRoutePages() {
  let outDir = 'dist'
  return {
    name: 'static-route-pages',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
    },
    async closeBundle() {
      const html = await readFile(resolve(outDir, 'index.html'), 'utf8')
      for (const { path, meta } of staticRoutes) {
        const title = escapeAttr(meta.title)
        const description = escapeAttr(meta.description)
        const page = html
          .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
          .replace(/(<meta name="description" content=")[^"]*(")/, `$1${description}$2`)
          .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`)
          .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${description}$2`)
          .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${meta.canonical}$2`)
          .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${title}$2`)
          .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${description}$2`)
          .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${meta.canonical}$2`)
          .replace('</head>', meta.noindex ? '  <meta name="robots" content="noindex, nofollow">\n</head>' : '</head>')
        await mkdir(resolve(outDir, path), { recursive: true })
        await writeFile(resolve(outDir, path, 'index.html'), page)
      }
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    staticRoutePages(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '#': fileURLToPath(new URL('./dist', import.meta.url))
    }
  }
})
