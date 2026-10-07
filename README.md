# Roeun Vireak — Portfolio

Personal portfolio for **Vireak Roeun** (Full-Stack Developer & DevOps Engineer) — live at <https://roeun-vireak.mxlab.site/>.

A small site built with **Vue 3 + Vite**: the portfolio homepage (`/`) and a course enquiry page (`/course/`). Clean light bento-grid design: background `#fafaf9`,
text `#0a0a0a`, muted `#525252`, borders `#e5e5e5`, single indigo accent `#4f46e5`; Outfit; MaxTune Equalizer‑M logo.

## Stack

- [Vue 3](https://vuejs.org/) (`<script setup>`) + [Vue Router 4](https://router.vuejs.org/) (`/` and `/course`)
- [Vite 6](https://vite.dev/) with `@vitejs/plugin-vue`
- Plain CSS in `src/assets/css/portfolio.css` (design tokens as CSS variables in `:root`)
- Fonts self-hosted from [`@fontsource/outfit`](https://fontsource.org/fonts/outfit) (latin subset, woff2, `font-display: swap`)
- Icons from [`bootstrap-icons`](https://icons.getbootstrap.com/)
- No analytics, no third-party requests at runtime

## Project layout

```
public/            Static files copied as-is: CV PDF, favicons/icons, og.png,
                   robots.txt, sitemap.xml, site.webmanifest
src/
  assets/css/      portfolio.css (tokens, layout, components)
  assets/img/      Profile photo (profile-520.webp + profile-520.jpg fallback)
  components/      BrandMark.vue (Equalizer-M logo, inline SVG), SectionHead.vue (section heading)
  router/          index.js (routes, scroll behaviour, per-route title/meta), meta.js (route titles/descriptions)
  views/HomeView.vue    All homepage sections and their content
  views/CourseView.vue  Course enquiry page: hero, enquiry form (opens a prefilled mailto:), contact cards, FAQ
index.html         SEO / Open Graph / Twitter tags, JSON-LD, icon links, font preloads
```

Site content (experience, projects, skills, links) lives in the `<script setup>` block of `src/views/HomeView.vue`.
The course page's facts and contact details live at the top of the `<script setup>` block in `src/views/CourseView.vue`.
There is no backend: the enquiry form validates in the browser, then opens the visitor's email app with a
prefilled message to the portfolio email (with Telegram as an alternative).

## Development

Requires Node.js 20+.

```sh
npm install
npm run dev       # Vite dev server with hot reload
npm run build     # production build -> dist/
npm run preview   # serve dist/ locally (http://127.0.0.1:4173)
```

## Deploy

`dist/` is **not committed** (it is in `.gitignore`). The host builds from source:

```sh
npm ci
npm run build
```

and serves the generated `dist/` directory at the site root (`/`), as a static site.
No SPA rewrite rules are required: the build also writes `dist/course/index.html` (same app, with the
course page's title/description/canonical baked in — see `staticRoutePages` in `vite.config.js`), so
`/course/` works on a direct visit or refresh. If you add another route, add it to `staticRoutes` there
and to `public/sitemap.xml`. `robots.txt`,
`sitemap.xml`, `og.png` and the icons must be served from the root as static files.

Things to keep in sync when the domain changes: the canonical/Open Graph URLs and JSON-LD in
`index.html`, `public/robots.txt` and `public/sitemap.xml`.

## Replacing the CV

Overwrite `public/Vireak-Roeun-CV.pdf` (same file name keeps the Download CV links working).

## Maintenance notes

- Social image: `public/og.png` is 1200×630. Re-generate it if the name/title changes.
- Profile image: `src/assets/img/profile-520.webp` (primary) and `profile-520.jpg` (fallback), 520×520.
- `prefers-reduced-motion` disables the reveal/hover animations.
