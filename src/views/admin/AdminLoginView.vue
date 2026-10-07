<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api, apiConfigured, setToken } from '../../admin/api.js'
import './admin.css'

const router = useRouter()
const route = useRoute()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref(route.query.expired ? 'Your session has expired. Please sign in again.' : '')

async function submit() {
  error.value = ''
  if (!email.value || !password.value) {
    error.value = 'Enter your email and password.'
    return
  }
  loading.value = true
  try {
    const data = await api('/admin/login', { method: 'POST', body: { email: email.value, password: password.value }, auth: false })
    setToken(data.token)
    const next =
      typeof route.query.next === 'string' && route.query.next.startsWith('/admin') && !route.query.next.startsWith('/admin/login')
        ? route.query.next
        : '/admin/overview'
    router.replace(next)
  } catch (e) {
    error.value = e.status === 422 && !Object.keys(e.errors).length ? e.message : e.status === 422 ? 'Enter a valid email and password.' : e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="adm login">
    <form class="adm-card login-card" novalidate @submit.prevent="submit">
      <p class="eyebrow">Admin</p>
      <h1>Sign in</h1>
      <p class="sub">Manage course enrollment requests.</p>

      <div v-if="!apiConfigured" class="adm-alert info">
        API not configured. Check <code>src/helpers/api</code> / <code>VITE_APP_MODE</code>.
      </div>
      <div v-if="error" class="adm-alert error" role="alert">{{ error }}</div>

      <label class="adm-label" for="email">Email</label>
      <input id="email" v-model.trim="email" class="adm-input" type="email" autocomplete="username" :disabled="!apiConfigured" />
      <label class="adm-label" for="password" style="margin-top: 14px">Password</label>
      <input id="password" v-model="password" class="adm-input" type="password" autocomplete="current-password" :disabled="!apiConfigured" />

      <button class="adm-btn primary full" type="submit" :disabled="loading || !apiConfigured">
        {{ loading ? 'Signing in…' : 'Sign in' }}
      </button>
      <router-link to="/" class="back">← Back to site</router-link>
    </form>
  </main>
</template>

<style scoped>
.login { display: grid; place-items: center; padding: 24px 16px; }
.login-card { width: 100%; max-width: 400px; padding: 32px 28px; box-shadow: 0 1px 2px rgb(0 0 0 / 4%), 0 12px 32px rgb(0 0 0 / 5%); }
.eyebrow { margin: 0; font-size: .78rem; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--accent); }
h1 { margin: 6px 0 4px; font-size: 1.75rem; letter-spacing: -0.02em; }
.sub { margin: 0 0 22px; color: var(--muted); }
.full { width: 100%; margin-top: 22px; height: 44px; }
.back { display: block; margin-top: 18px; text-align: center; color: var(--muted); font-size: .88rem; text-decoration: none; }
.back:hover { color: var(--accent-ink); }
code { font-size: .85em; }
</style>
