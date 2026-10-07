# Backend handoff — portfolio + course admin

**Backend owner:** Cursor agent (this repo’s engine work)  
**Frontend design owner:** Grok bot  
**Repos**
- Frontend: `D:\myportforlio\myportforlio` (Vite + Vue 3 + vue-router)
- Engine: `D:\myprojects\myportfolio-engine` (Laravel 13, PHP 8.3+, Sanctum)

**Local engine URL:** `https://myportfolio-engine.test`  
**Production engine URL (config):** `https://myportfolio-engine.mxlab.site`  
Configured in frontend: [`src/helpers/api/apiConfig.js`](src/helpers/api/apiConfig.js) via `VITE_APP_MODE` / `VITE_ENGINE_URL`.

---

## Responsibility split

| Area | Owner | Notes |
|------|--------|--------|
| Laravel APIs, migrations, models, seeders, PHPUnit | **Backend** | Do not break public `POST /api/course-enquiries` payload |
| Axios / `helpers/api` client wiring | **Backend** (done) | Grok may restyle UI only; keep `engineAPI` / `api()` contracts |
| `/admin` layout, pages, interactions | **Grok (design)** | Match homepage **bento / tile** theme |
| Public `/course` visual redesign | **Grok (design)** | Same theme; keep form fields + API submit logic |
| Theme tokens, CSS composition | **Grok (design)** | See “Design system” below |

---

## Design system (for Grok)

The live homepage is the source of truth — **not** a full-bleed marketing hero.

- Light stone bg `#fafaf9`, surfaces white / `#f5f5f4`
- Text `#0a0a0a`, muted `#525252`, borders `#e5e5e5`
- Accent indigo `#4F46E5` / soft `#eef2ff`
- Font: **Outfit**
- Layout language: **bento grid + `.tile` cards**, rounded ~20–28px
- Buttons: pill `.btn` / `.btn-accent` / `.btn-ghost`
- Avoid: purple glow stacks, newspaper layout, cream/terracotta, dark mode default

**Course page note:** A previous redesign used a full-bleed photo hero. That **does not match** the homepage. Prefer restoring a **tile/bento** composition (intro tile + photo tile, form as its own tile section).

Admin area: reuse [`src/views/admin/admin.css`](src/views/admin/admin.css) + portfolio tokens. Keep indigo light look.

---

## What backend already covers

### Public API

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/course-enquiries` | Enrollment request (honeypot `website`, rate limit) |
| `GET` | `/api/courses` | Published courses (+ modules, open/full cohorts) |
| `GET` | `/api/courses/{slug}` | One published course by slug |

**Enquiry body (required):**  
`name`, `email`, `language` (`en`\|`km`), `format` (`online`\|`in_person`\|`either`), `level` (fixed enum), `message`  
**Optional:** `contact`, `website` (honeypot, must be empty), `course_id`, `cohort_id`

### Admin API (Sanctum bearer)

Create admin:

```bash
cd D:\myprojects\myportfolio-engine
php artisan admin:create you@example.com
```

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/admin/login` | `{ email, password }` → `{ token, user }` (14-day token) |
| `POST` | `/api/admin/logout` | Revoke current token |
| `GET` | `/api/admin/me` | `{ user }` |
| `GET` | `/api/admin/stats` | `{ total, by_status }` |
| `GET` | `/api/admin/overview` | KPIs, 30-day daily counts, latest 5 |
| `GET` | `/api/admin/course-enquiries` | Paginated; `?status=&search=&page=&course_id=&cohort_id=` |
| `GET` | `/api/admin/course-enquiries/{id}` | `{ data }` |
| `PATCH` | `/api/admin/course-enquiries/{id}` | `{ status?, admin_note? }` |
| `DELETE` | `/api/admin/course-enquiries/{id}` | Hard delete |
| `GET` | `/api/admin/course-enquiries/export` | CSV |
| `GET/POST` | `/api/admin/courses` | List / create |
| `GET/PATCH/DELETE` | `/api/admin/courses/{id}` | Show / update / delete |
| `POST` | `/api/admin/courses/{id}/modules` | Add module |
| `PATCH` | `/api/admin/courses/{id}/modules/reorder` | `{ order: [ids…] }` |
| `PATCH/DELETE` | `/api/admin/courses/{id}/modules/{module}` | Update / delete module |
| `POST` | `/api/admin/courses/{id}/cohorts` | Add cohort/class |
| `PATCH/DELETE` | `/api/admin/courses/{id}/cohorts/{cohort}` | Update / delete cohort |

**Auth header:** `Authorization: Bearer <token>`  
**CORS:** engine `FRONTEND_URLS` must include the Vite origin (e.g. `http://localhost:5173`).

### Domain models (engine)

- `Course` — title, slug, summary, hours, languages[], level, is_published  
- `CourseModule` — order, title, hours, description  
- `Cohort` — title, dates, schedule_text, format (`online`\|`in_person`\|`hybrid`), seats, price, currency, status (`draft`\|`open`\|`full`\|`closed`)  
- `CourseEnquiry` — + `admin_note`, `course_id`, `cohort_id`  
- Seeder: `php artisan db:seed --class=CourseSeeder` → slug `full-stack-teaching-course`

### Frontend API layer (keep as-is unless backend changes)

```
src/helpers/api/
  apiConfig.js      # local / production hosts
  createApiClient.js # axios + bearer + ApiError
  clients.js         # engineAPI
  index.js
src/admin/api.js     # getToken / setToken / api() used by admin views
```

### Admin routes already wired (function over polish)

- `/admin/login`
- `/admin` → redirect overview  
- `/admin/overview` — KPIs + chart + latest  
- `/admin/enrollments` — list, filters, detail panel, CSV, inline status  
- `/admin/courses` — list, detail, modules/cohorts, enrollment dialog  
- Placeholders: students, content, settings  

Static host: [`vite.config.js`](vite.config.js) writes `dist/admin/**/index.html` for each path.

### Tests (engine)

```bash
cd D:\myprojects\myportfolio-engine
php artisan test
```

Covers public enquiries, admin auth/CRUD, overview, courses/cohorts, course-linked enquiries.

---

## What Grok should focus on (frontend design)

1. **Restyle `/course` to match homepage bento/tiles** — keep:
   - Form fields and validation behavior  
   - `engineAPI.post('/course-enquiries', …)` with optional `course_id` / `cohort_id`  
   - Loading course via `GET /api/courses/full-stack-teaching-course` when API configured  
   - `#enroll` deep link from homepage  

2. **Polish `/admin` visuals** without changing endpoint shapes:
   - Prefer existing `admin.css` + portfolio tokens  
   - Mobile bottom tabs already exist in `AdminLayout.vue`  
   - Do not invent new admin API fields without backend  

3. **Do not**
   - Hardcode a different API base than `helpers/api`  
   - Remove Sanctum token login flow  
   - Change enquiry payload keys without coordinating backend  

---

## Deferred (backend later — not for Grok alone)

From original dashboard plan, not built yet:

- Students / payments CRUD  
- Enquiry activity log / kanban board  
- Portfolio CMS (projects, skills, experiences, testimonials)  
- Settings (password, sessions, notification prefs, 2FA)  
- Analytics (Umami/Plausible)  

When those are needed, backend adds APIs + tests first; Grok designs the screens after.

---

## Quick local checklist

**Engine**

```bash
cd D:\myprojects\myportfolio-engine
composer install
php artisan migrate
php artisan db:seed --class=CourseSeeder
php artisan admin:create you@example.com
# Herd: https://myportfolio-engine.test
```

**Frontend**

```bash
cd D:\myportforlio\myportforlio
npm install
# optional .env: VITE_APP_MODE=local
npm run dev
```

Open `/course` and `/admin/login`.

---

## File map (backend-relevant)

**Engine**

- `routes/api.php`
- `app/Http/Controllers/Api/*`
- `app/Http/Controllers/Api/Admin/*`
- `app/Models/{Course,CourseModule,Cohort,CourseEnquiry,User}.php`
- `database/migrations/2026_10_07_*`
- `database/seeders/CourseSeeder.php`
- `tests/Feature/{CourseEnquiryTest,AdminApiTest,CourseAdminTest}.php`

**Frontend (API + current admin/course logic)**

- `src/helpers/api/*`
- `src/admin/api.js`
- `src/views/admin/*`
- `src/views/CourseView.vue` ← **Grok redesign target (theme match)**
- `src/assets/css/portfolio.css` ← tokens + home bento; keep consistent

---

*Last updated for handoff: usability admin API + courses/cohorts + axios helpers. Frontend visual language for `/course` should follow homepage bento, not the interim full-bleed hero.*
