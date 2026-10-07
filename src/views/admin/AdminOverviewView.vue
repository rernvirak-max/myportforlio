<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api, apiConfigured } from '../../admin/api.js'

const router = useRouter()
const loading = ref(false)
const error = ref('')
const data = ref(null)

const pct = computed(() => {
  const rate = data.value?.conversion_rate ?? 0
  return `${Math.round(rate * 1000) / 10}%`
})

const maxDaily = computed(() => Math.max(1, ...(data.value?.daily_counts?.map((d) => d.count) || [1])))

const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

async function load() {
  if (!apiConfigured) return
  loading.value = true
  error.value = ''
  try {
    data.value = await api('/admin/overview')
  } catch (e) {
    if (e.status !== 401) error.value = e.message
  } finally {
    loading.value = false
  }
}

function openEnquiry(row) {
  router.push({ name: 'admin-enrollments', query: { open: String(row.id) } })
}

onMounted(load)
</script>

<template>
  <div class="overview">
    <div v-if="error" class="adm-alert error" role="alert">
      {{ error }} <button class="link" type="button" @click="load">Try again</button>
    </div>
    <div v-if="loading && !data" class="empty">Loading overview…</div>

    <template v-else-if="data">
      <section class="kpis">
        <article class="adm-card kpi">
          <span class="label">New (7 days)</span>
          <strong>{{ data.new_last_7_days }}</strong>
        </article>
        <article class="adm-card kpi">
          <span class="label">New (30 days)</span>
          <strong>{{ data.new_last_30_days }}</strong>
        </article>
        <article class="adm-card kpi">
          <span class="label">Conversion</span>
          <strong>{{ pct }}</strong>
          <span class="sub">{{ data.by_status.enrolled }} enrolled / {{ data.total }} total</span>
        </article>
        <article class="adm-card kpi">
          <span class="label">Needs action</span>
          <strong>{{ data.by_status.new }}</strong>
          <span class="sub">status = new</span>
        </article>
      </section>

      <section class="status-row">
        <button
          v-for="(count, status) in data.by_status"
          :key="status"
          type="button"
          class="adm-card status-chip"
          @click="router.push({ name: 'admin-enrollments', query: { status } })"
        >
          <span class="badge" :class="status">{{ status }}</span>
          <strong>{{ count }}</strong>
        </button>
      </section>

      <section class="adm-card chart-card">
        <header>
          <h2>Requests per day</h2>
          <p>Last 30 days</p>
        </header>
        <div class="chart" role="img" :aria-label="`Daily request counts for the last 30 days`">
          <div
            v-for="day in data.daily_counts"
            :key="day.date"
            class="bar-wrap"
            :title="`${day.date}: ${day.count}`"
          >
            <div class="bar" :style="{ height: `${(day.count / maxDaily) * 100}%` }" />
          </div>
        </div>
        <div class="chart-axis">
          <span>{{ data.daily_counts[0]?.date }}</span>
          <span>{{ data.daily_counts[data.daily_counts.length - 1]?.date }}</span>
        </div>
      </section>

      <section class="adm-card latest">
        <header>
          <h2>Latest requests</h2>
          <RouterLink class="adm-btn sm" :to="{ name: 'admin-enrollments' }">View all</RouterLink>
        </header>
        <div v-if="!data.latest.length" class="empty">No course requests yet.</div>
        <ul v-else>
          <li v-for="row in data.latest" :key="row.id">
            <button type="button" class="latest-row" @click="openEnquiry(row)">
              <div>
                <strong>{{ row.name }}</strong>
                <span>{{ row.email }}</span>
              </div>
              <div class="right">
                <span class="badge" :class="row.status">{{ row.status }}</span>
                <time>{{ fmtDate(row.created_at) }}</time>
              </div>
            </button>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>

<style scoped>
.link { background: none; border: 0; padding: 0; color: inherit; font: inherit; text-decoration: underline; cursor: pointer; }
.empty { padding: 40px 16px; text-align: center; color: var(--muted); }
.kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 12px; }
.kpi { padding: 16px 18px; display: flex; flex-direction: column; gap: 4px; }
.kpi .label { color: var(--muted); font-size: .85rem; }
.kpi strong { font-size: 1.7rem; letter-spacing: -0.02em; }
.kpi .sub { color: var(--muted); font-size: .8rem; }
.status-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px; }
.status-chip {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  padding: 14px 16px; font: inherit; color: inherit; cursor: pointer; text-align: left;
}
.status-chip:hover { border-color: var(--accent-line); }
.status-chip strong { font-size: 1.25rem; }
.chart-card { padding: 18px 18px 14px; margin-bottom: 16px; }
.chart-card header, .latest header { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
.chart-card h2, .latest h2 { margin: 0; font-size: 1.05rem; }
.chart-card p { margin: 0; color: var(--muted); font-size: .85rem; }
.chart {
  display: grid;
  grid-template-columns: repeat(30, 1fr);
  align-items: end;
  gap: 3px;
  height: 140px;
  padding: 8px 0 0;
}
.bar-wrap { height: 100%; display: flex; align-items: end; }
.bar {
  width: 100%;
  min-height: 2px;
  border-radius: 4px 4px 0 0;
  background: var(--accent);
  opacity: .85;
}
.chart-axis { display: flex; justify-content: space-between; margin-top: 8px; color: var(--muted); font-size: .75rem; }
.latest { padding: 18px; }
.latest ul { list-style: none; margin: 0; padding: 0; }
.latest li + li { border-top: 1px solid var(--border); }
.latest-row {
  width: 100%; display: flex; justify-content: space-between; gap: 12px; align-items: center;
  padding: 12px 4px; border: 0; background: none; font: inherit; color: inherit; cursor: pointer; text-align: left;
}
.latest-row:hover { background: var(--accent-soft); border-radius: 10px; }
.latest-row strong { display: block; }
.latest-row span { color: var(--muted); font-size: .85rem; }
.latest-row .right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.latest-row time { color: var(--muted); font-size: .78rem; white-space: nowrap; }

@media (max-width: 900px) {
  .kpis { grid-template-columns: repeat(2, 1fr); }
  .status-row { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 560px) {
  .kpis { grid-template-columns: 1fr 1fr; }
  .chart { height: 110px; gap: 2px; }
}
</style>
