<script setup>
import { computed, onBeforeUnmount, onMounted, provide, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api, apiConfigured, clearToken, setUnauthorizedHandler } from '../../admin/api.js'
import './admin.css'

const NAV = [
  { name: 'admin-overview', label: 'Overview', icon: 'bi-speedometer2' },
  { name: 'admin-enrollments', label: 'Enrollments', icon: 'bi-inbox' },
  { name: 'admin-courses', label: 'Courses', icon: 'bi-journal-bookmark' },
  { name: 'admin-students', label: 'Students', icon: 'bi-people' },
  { name: 'admin-content', label: 'Content', icon: 'bi-layout-text-window' },
  { name: 'admin-settings', label: 'Settings', icon: 'bi-gear' },
]

const route = useRoute()
const router = useRouter()
const user = ref(null)
const bootError = ref('')

setUnauthorizedHandler(() => router.replace({ name: 'admin-login', query: { expired: 1 } }))
provide('adminUser', user)

const pageTitle = computed(() => route.meta.adminTitle || 'Admin')

async function logout() {
  try {
    await api('/admin/logout', { method: 'POST' })
  } catch {
    /* ignore */
  }
  clearToken()
  router.replace({ name: 'admin-login' })
}

onMounted(async () => {
  if (!apiConfigured) return
  try {
    user.value = (await api('/admin/me')).user
  } catch (e) {
    if (e.status !== 401) bootError.value = e.message
  }
})

onBeforeUnmount(() => setUnauthorizedHandler(() => {}))
</script>

<template>
  <div class="adm shell">
    <aside class="adm-side" aria-label="Admin navigation">
      <div class="side-brand">
        <span class="side-mark">VR</span>
        <div>
          <strong>Admin</strong>
          <p>Portfolio</p>
        </div>
      </div>
      <nav class="side-nav">
        <RouterLink
          v-for="item in NAV"
          :key="item.name"
          :to="{ name: item.name }"
          class="side-link"
          active-class="active"
        >
          <i :class="['bi', item.icon]" aria-hidden="true" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>
    </aside>

    <div class="adm-main">
      <header class="adm-topbar">
        <div>
          <h1>{{ pageTitle }}</h1>
          <p v-if="user">Signed in as {{ user.email }}</p>
          <p v-else-if="!apiConfigured">API not configured</p>
        </div>
        <button class="adm-btn" type="button" @click="logout">Log out</button>
      </header>

      <div v-if="!apiConfigured" class="adm-alert info adm-page-alert">
        Admin API is not configured. Check <code>src/helpers/api</code> / <code>VITE_APP_MODE</code>.
      </div>
      <div v-else-if="bootError" class="adm-alert error adm-page-alert" role="alert">{{ bootError }}</div>

      <div class="adm-page">
        <RouterView />
      </div>
    </div>

    <nav class="adm-tabs" aria-label="Admin sections">
      <RouterLink
        v-for="item in NAV"
        :key="item.name"
        :to="{ name: item.name }"
        class="tab-link"
        active-class="active"
      >
        <i :class="['bi', item.icon]" aria-hidden="true" />
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>
  </div>
</template>

<style scoped>
.shell {
  display: grid;
  grid-template-columns: 220px 1fr;
  min-height: 100vh;
}
.adm-side {
  position: sticky;
  top: 0;
  align-self: start;
  height: 100vh;
  padding: 20px 14px;
  border-right: 1px solid var(--border);
  background: var(--surface);
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.side-brand {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 0 8px;
}
.side-mark {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: var(--accent);
  color: #fff;
  font-weight: 700;
  font-size: .85rem;
}
.side-brand strong { display: block; font-size: .95rem; }
.side-brand p { margin: 0; font-size: .78rem; color: var(--muted); }
.side-nav { display: flex; flex-direction: column; gap: 4px; }
.side-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  color: var(--text-2);
  text-decoration: none;
  font-size: .92rem;
  font-weight: 500;
}
.side-link i { font-size: 1.05rem; opacity: .85; }
.side-link:hover { background: var(--accent-soft); color: var(--accent-ink); }
.side-link.active { background: var(--accent-soft); color: var(--accent-ink); }
.adm-main { min-width: 0; display: flex; flex-direction: column; }
.adm-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 24px 0;
}
.adm-topbar h1 { font-size: 1.45rem; margin: 0; letter-spacing: -0.02em; }
.adm-topbar p { margin: 2px 0 0; color: var(--muted); font-size: .9rem; }
.adm-page { padding: 16px 24px 48px; max-width: 1200px; width: 100%; }
.adm-page-alert { margin: 16px 24px 0; }
.adm-tabs { display: none; }

@media (max-width: 640px) {
  .shell { grid-template-columns: 1fr; }
  .adm-side { display: none; }
  .adm-topbar { padding: 16px 14px 0; }
  .adm-page { padding: 12px 14px 88px; }
  .adm-page-alert { margin: 12px 14px 0; }
  .adm-tabs {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 30;
    background: var(--surface);
    border-top: 1px solid var(--border);
    padding: 6px 4px calc(6px + env(safe-area-inset-bottom));
  }
  .tab-link {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 6px 2px;
    text-decoration: none;
    color: var(--muted);
    font-size: .62rem;
    font-weight: 500;
    line-height: 1.15;
    text-align: center;
  }
  .tab-link i { font-size: 1.15rem; }
  .tab-link.active { color: var(--accent-ink); }
}
</style>
