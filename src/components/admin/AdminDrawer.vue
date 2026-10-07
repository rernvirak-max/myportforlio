<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
defineProps({ title: String, subtitle: String, wide: Boolean })
const emit = defineEmits(['close'])
const onKey = (e) => e.key === 'Escape' && emit('close')
onMounted(() => { document.addEventListener('keydown', onKey); document.body.style.overflow = 'hidden' })
onBeforeUnmount(() => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' })
</script>
<template>
  <Teleport to="body">
    <div class="drawer-scrim" @click.self="emit('close')">
      <aside class="drawer" :class="{ wide }" role="dialog" aria-modal="true" :aria-label="title">
        <header class="drawer-head">
          <div>
            <h2>{{ title }}</h2>
            <p v-if="subtitle">{{ subtitle }}</p>
          </div>
          <button class="adm-btn sm icon" type="button" aria-label="Close" @click="emit('close')"><i class="bi bi-x-lg"></i></button>
        </header>
        <div class="drawer-body"><slot /></div>
        <footer v-if="$slots.footer" class="drawer-foot"><slot name="footer" /></footer>
      </aside>
    </div>
  </Teleport>
</template>
<style scoped>
.drawer-scrim { position: fixed; inset: 0; z-index: 120; background: rgb(24 24 27 / 32%); display: flex; justify-content: flex-end; font-family: "Outfit", system-ui, sans-serif; color: var(--text); }
.drawer { width: min(520px, 100%); height: 100%; background: #fff; border-radius: 28px 0 0 28px; display: flex; flex-direction: column; box-shadow: -20px 0 60px rgb(0 0 0 / 12%); animation: slide .22s ease-out; }
.drawer.wide { width: min(680px, 100%); }
.drawer-head { display: flex; justify-content: space-between; gap: 12px; padding: 24px 24px 12px; }
.drawer-head h2 { margin: 0; font-size: 1.3rem; letter-spacing: -0.02em; }
.drawer-head p { margin: 4px 0 0; color: var(--muted); font-size: .88rem; }
.drawer-body { flex: 1; overflow: auto; padding: 8px 24px 24px; }
.drawer-foot { display: flex; justify-content: flex-end; gap: 8px; padding: 14px 24px; border-top: 1px solid var(--border); }
@keyframes slide { from { transform: translateX(40px); opacity: 0; } }
@media (max-width: 640px) {
  .drawer, .drawer.wide { width: 100%; border-radius: 0; }
  .drawer-head { padding: 18px 16px 8px; } .drawer-body { padding: 8px 16px 20px; } .drawer-foot { padding: 12px 16px; }
}
</style>
