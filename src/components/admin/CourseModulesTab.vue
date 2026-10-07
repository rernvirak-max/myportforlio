<script setup>
import { computed, reactive, ref } from 'vue'
import { createModule, deleteModule, fieldErrors, reorderModules, updateModule } from '../../admin/courseApi.js'
import { toast, toastError } from '../../admin/toast.js'

const props = defineProps({ course: { type: Object, required: true } })
const emit = defineEmits(['changed'])

const modules = computed(() => props.course.modules || [])
const total = computed(() => modules.value.reduce((n, m) => n + (Number(m.hours) || 0), 0))
const target = computed(() => Number(props.course.hours) || 0)
const pct = computed(() => (target.value ? Math.min(100, Math.round((total.value / target.value) * 100)) : 0))

const draft = reactive({ title: '', hours: 4, description: '' })
const addErrors = ref({})
const editingId = ref(null)
const edit = reactive({ title: '', hours: 0, description: '' })
const editErrors = ref({})
const busy = ref(false)
const dragId = ref(null)
const overId = ref(null)

async function add() {
  addErrors.value = {}
  if (!draft.title.trim()) return (addErrors.value = { title: 'Module title is required.' })
  busy.value = true
  try {
    await createModule(props.course.id, { title: draft.title.trim(), hours: draft.hours === '' ? null : Number(draft.hours), description: draft.description || null })
    Object.assign(draft, { title: '', hours: 4, description: '' })
    toast('Module added.')
    emit('changed')
  } catch (e) { addErrors.value = fieldErrors(e); toastError(e) } finally { busy.value = false }
}
function startEdit(m) { editingId.value = m.id; editErrors.value = {}; Object.assign(edit, { title: m.title, hours: m.hours ?? '', description: m.description || '' }) }
async function saveEdit(m) {
  editErrors.value = {}
  if (!edit.title.trim()) return (editErrors.value = { title: 'Module title is required.' })
  busy.value = true
  try {
    await updateModule(props.course.id, m.id, { title: edit.title.trim(), hours: edit.hours === '' ? null : Number(edit.hours), description: edit.description || null })
    editingId.value = null
    toast('Module saved.')
    emit('changed')
  } catch (e) { editErrors.value = fieldErrors(e); toastError(e) } finally { busy.value = false }
}
async function remove(m) {
  if (!window.confirm(`Delete module “${m.title}”?`)) return
  try { await deleteModule(props.course.id, m.id); toast('Module deleted.'); emit('changed') } catch (e) { toastError(e) }
}
async function persist(ids) {
  try { await reorderModules(props.course.id, ids); toast('Order saved.'); emit('changed') } catch (e) { toastError(e); emit('changed') }
}
function move(index, delta) {
  const ids = modules.value.map((m) => m.id)
  const j = index + delta
  if (j < 0 || j >= ids.length) return
  ;[ids[index], ids[j]] = [ids[j], ids[index]]
  persist(ids)
}
function onDrop(targetId) {
  const from = dragId.value
  dragId.value = overId.value = null
  if (!from || from === targetId) return
  const ids = modules.value.map((m) => m.id).filter((id) => id !== from)
  ids.splice(ids.indexOf(targetId), 0, from)
  persist(ids)
}
</script>

<template>
  <div class="mods">
    <section class="tile hours">
      <div>
        <strong>{{ total }}h</strong> of {{ target || '—' }}h planned
        <span v-if="target && total > target" class="warn">· {{ total - target }}h over course hours</span>
        <span v-else-if="target && total < target" class="muted">· {{ target - total }}h left to plan</span>
        <span v-else-if="target" class="okc">· matches course hours</span>
      </div>
      <div class="progress" :class="{ ok: target && total === target }"><span :style="{ width: (total > target ? 100 : pct) + '%', background: total > target ? '#dc2626' : undefined }"></span></div>
    </section>

    <ol class="list">
      <li v-for="(m, i) in modules" :key="m.id" class="tile row" :class="{ over: overId === m.id, dragging: dragId === m.id }"
        :draggable="editingId !== m.id" @dragstart="dragId = m.id" @dragend="dragId = overId = null"
        @dragover.prevent="overId = m.id" @dragleave="overId === m.id && (overId = null)" @drop.prevent="onDrop(m.id)">
        <template v-if="editingId !== m.id">
          <span class="grip" aria-hidden="true"><i class="bi bi-grip-vertical"></i></span>
          <span class="num">{{ i + 1 }}</span>
          <div class="body"><strong>{{ m.title }}</strong><p>{{ m.description || 'No description.' }}</p></div>
          <span class="hrs">{{ m.hours ?? 0 }}h</span>
          <div class="acts">
            <button class="adm-btn sm icon" type="button" :disabled="i === 0" aria-label="Move up" @click="move(i, -1)"><i class="bi bi-arrow-up"></i></button>
            <button class="adm-btn sm icon" type="button" :disabled="i === modules.length - 1" aria-label="Move down" @click="move(i, 1)"><i class="bi bi-arrow-down"></i></button>
            <button class="adm-btn sm icon" type="button" aria-label="Edit" @click="startEdit(m)"><i class="bi bi-pencil"></i></button>
            <button class="adm-btn sm icon danger" type="button" aria-label="Delete" @click="remove(m)"><i class="bi bi-trash"></i></button>
          </div>
        </template>
        <form v-else class="inline" @submit.prevent="saveEdit(m)">
          <div class="adm-field t" :class="{ invalid: editErrors.title }"><input v-model="edit.title" class="adm-input" aria-label="Title" /><small v-if="editErrors.title" class="adm-err">{{ editErrors.title }}</small></div>
          <div class="adm-field h" :class="{ invalid: editErrors.hours }"><input v-model="edit.hours" type="number" min="0" max="500" class="adm-input" aria-label="Hours" /><small v-if="editErrors.hours" class="adm-err">{{ editErrors.hours }}</small></div>
          <div class="adm-field d"><textarea v-model="edit.description" class="adm-textarea" rows="2" aria-label="Description"></textarea></div>
          <div class="fa"><button class="adm-btn sm pill" type="button" @click="editingId = null">Cancel</button><button class="adm-btn sm primary pill" :disabled="busy">Save</button></div>
        </form>
      </li>
    </ol>
    <p v-if="!modules.length" class="muted empty">No modules yet. Add the first one below.</p>

    <form class="tile inline add" @submit.prevent="add">
      <div class="adm-field t" :class="{ invalid: addErrors.title }"><label class="adm-label">New module</label><input v-model="draft.title" class="adm-input" placeholder="e.g. HTML & CSS foundations" /><small v-if="addErrors.title" class="adm-err">{{ addErrors.title }}</small></div>
      <div class="adm-field h" :class="{ invalid: addErrors.hours }"><label class="adm-label">Hours</label><input v-model="draft.hours" type="number" min="0" max="500" class="adm-input" /><small v-if="addErrors.hours" class="adm-err">{{ addErrors.hours }}</small></div>
      <div class="adm-field d"><label class="adm-label">Description</label><textarea v-model="draft.description" class="adm-textarea" rows="2"></textarea></div>
      <div class="fa"><button class="adm-btn primary pill" :disabled="busy"><i class="bi bi-plus-lg"></i> Add module</button></div>
    </form>
  </div>
</template>

<style scoped>
.tile { background: #fff; border: 1px solid var(--border); border-radius: 22px; }
.hours { padding: 16px 20px; margin-bottom: 14px; display: grid; gap: 10px; }
.warn { color: #b91c1c; } .okc { color: #15803d; } .muted { color: var(--muted); }
.list { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.row { display: flex; align-items: center; gap: 12px; padding: 14px 16px; cursor: grab; }
.row.over { border-color: #4F46E5; box-shadow: 0 0 0 3px #eef2ff; } .row.dragging { opacity: .45; }
.grip { color: #a1a1aa; } .num { width: 30px; height: 30px; border-radius: 50%; background: #eef2ff; color: #4F46E5; display: grid; place-items: center; font-weight: 600; flex: none; }
.body { flex: 1; min-width: 0; } .body p { margin: 2px 0 0; color: var(--muted); font-size: .86rem; }
.hrs { font-weight: 600; } .acts { display: flex; gap: 4px; }
.inline { display: grid; grid-template-columns: 1fr 110px; gap: 0 10px; width: 100%; cursor: auto; }
.inline .d { grid-column: 1 / -1; } .inline .fa { grid-column: 1 / -1; display: flex; justify-content: flex-end; gap: 8px; }
.add { padding: 18px 20px; margin-top: 14px; }
.empty { padding: 18px; text-align: center; }
@media (max-width: 640px) { .row { flex-wrap: wrap; } .acts { width: 100%; justify-content: flex-end; } .grip { display: none; } }
</style>
