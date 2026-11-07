<script setup lang="ts">
const mode = ref<'lines' | 'spaces'>('lines')
const pick = ref(1)

const spec = computed(() => ({
  notes: [] as number[],
  highlight: { kind: mode.value === 'lines' ? ('line' as const) : ('space' as const), index: pick.value },
}))

const count = computed(() => (mode.value === 'lines' ? 5 : 4))

function setMode(m: 'lines' | 'spaces') {
  mode.value = m
  pick.value = 1
}
</script>

<template>
  <div class="anatomy">
    <div class="tabs">
      <button :class="{ on: mode === 'lines' }" @click="setMode('lines')">5 linhas</button>
      <button :class="{ on: mode === 'spaces' }" class="sp" @click="setMode('spaces')">4 espaços</button>
    </div>

    <StaffSvg :spec="spec" :numbering="mode" :max-width="420" />

    <div class="picker">
      <button
        v-for="n in count"
        :key="`${mode}${n}`"
        :class="[{ on: pick === n }, mode]"
        @click="pick = n"
      >
        {{ n }}{{ mode === 'lines' ? 'ª linha' : 'º espaço' }}
      </button>
    </div>
    <p class="muted hint">Contamos sempre <strong>de baixo para cima</strong>.</p>
  </div>
</template>

<style scoped>
.anatomy {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: var(--r-md);
}

.tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  padding: 4px;
  background: var(--surface-2);
  border-radius: var(--r-sm);
}

.tabs button {
  border: 0;
  background: none;
  padding: 10px;
  border-radius: var(--r-xs);
  font-weight: 900;
  color: var(--muted);
}

.tabs button.on {
  background: var(--surface);
  color: var(--primary);
  box-shadow: 0 2px 0 var(--border);
}

.tabs button.sp.on {
  color: var(--text);
}

.picker {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
}

.picker button {
  border: 2px solid var(--border);
  background: var(--surface);
  border-radius: var(--r-sm);
  padding: 6px 10px;
  font-weight: 800;
  font-size: 13px;
  color: var(--muted);
}

.picker button.on.lines {
  border-color: var(--primary);
  background: var(--primary-soft);
  color: var(--primary);
}

.picker button.on.spaces {
  border-color: var(--muted);
  background: var(--surface-2);
  color: var(--text);
}

.hint {
  font-size: 13px;
  text-align: center;
}
</style>
