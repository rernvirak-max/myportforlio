<script setup>
import { toasts } from '../../admin/toast.js'
</script>
<template>
  <Teleport to="body">
    <div class="toasts" aria-live="polite">
      <div v-for="t in toasts" :key="t.id" class="toast" :class="t.type" role="status">
        <i :class="t.type === 'error' ? 'bi bi-exclamation-circle' : t.type === 'info' ? 'bi bi-info-circle' : 'bi bi-check-circle'" aria-hidden="true"></i>
        {{ t.message }}
      </div>
    </div>
  </Teleport>
</template>
<style scoped>
.toasts { position: fixed; right: 20px; bottom: 20px; z-index: 200; display: flex; flex-direction: column; gap: 8px; max-width: min(380px, calc(100vw - 32px)); }
.toast { display: flex; gap: 10px; align-items: center; padding: 12px 16px; border-radius: 999px; background: #18181b; color: #fff; font: 500 .9rem "Outfit", system-ui, sans-serif; box-shadow: 0 12px 30px rgb(0 0 0 / 18%); }
.toast.ok i { color: #4ade80; }
.toast.error { background: #991b1b; }
.toast.info i { color: #a5b4fc; }
@media (max-width: 640px) { .toasts { left: 16px; right: 16px; bottom: 16px; max-width: none; } .toast { border-radius: 18px; } }
</style>
