<script setup lang="ts">
import { Eye, EyeOff, Volume2 } from 'lucide-vue-next'

type Col = 'names' | 'rests' | 'numbers'
const hidden = ref<Col | null>(null)
const revealed = ref<Set<string>>(new Set())
const active = ref<number | null>(null)
const { scheduleNote } = useAudio()
let timer: ReturnType<typeof setTimeout> | null = null

function toggleHide(c: Col) {
  hidden.value = hidden.value === c ? null : c
  revealed.value = new Set()
}

function isHidden(c: Col, row: number) {
  return hidden.value === c && !revealed.value.has(`${c}${row}`)
}

function reveal(c: Col, row: number) {
  if (hidden.value !== c) return
  revealed.value = new Set([...revealed.value, `${c}${row}`])
}

/** Toca quantas figuras daquela linha cabem numa semibreve */
function play(i: number) {
  const f = FIGURES[i]!
  const total = 2.4
  const each = total / f.value
  for (let k = 0; k < f.value; k++) scheduleNote(67, k * each, Math.max(0.03, each * 0.85), f.value > 16 ? 0.14 : 0.2)
  active.value = i
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => (active.value = null), total * 1000 + 100)
}
</script>

<template>
  <div class="ftable">
    <div class="tools">
      <span class="muted">Teste sua memória:</span>
      <button :class="{ on: hidden === 'names' }" @click="toggleHide('names')">
        <component :is="hidden === 'names' ? EyeOff : Eye" :size="15" /> Nomes
      </button>
      <button :class="{ on: hidden === 'rests' }" @click="toggleHide('rests')">
        <component :is="hidden === 'rests' ? EyeOff : Eye" :size="15" /> Pausas
      </button>
      <button :class="{ on: hidden === 'numbers' }" @click="toggleHide('numbers')">
        <component :is="hidden === 'numbers' ? EyeOff : Eye" :size="15" /> Números
      </button>
    </div>

    <div class="grid" role="table" aria-label="Tabela de figuras musicais">
      <div class="row head" role="row">
        <span role="columnheader">Figura de som</span>
        <span role="columnheader">Nome</span>
        <span role="columnheader">Figura de silêncio</span>
        <span role="columnheader">Nome</span>
        <span role="columnheader">Nº</span>
      </div>
      <div
        v-for="(f, i) in FIGURES"
        :key="f.value"
        class="row"
        :class="{ active: active === i }"
        role="row"
      >
        <button class="cell fig" :aria-label="`Ouvir ${f.value} ${f.name}s`" @click="play(i)">
          <MusicFigureIcon kind="note" :value="f.value" :size="46" />
          <Volume2 :size="13" class="spk" />
        </button>
        <button class="cell name" :class="{ masked: isHidden('names', i) }" @click="reveal('names', i)">
          {{ isHidden('names', i) ? '?' : f.name }}
        </button>
        <button class="cell fig" :class="{ masked: isHidden('rests', i) }" @click="reveal('rests', i)">
          <span v-if="isHidden('rests', i)">?</span>
          <MusicFigureIcon v-else kind="rest" :value="f.value" :size="46" />
        </button>
        <button class="cell name small" :class="{ masked: isHidden('names', i) }" @click="reveal('names', i)">
          {{ isHidden('names', i) ? '?' : f.restName }}
        </button>
        <button class="cell num" :class="{ masked: isHidden('numbers', i) }" @click="reveal('numbers', i)">
          {{ isHidden('numbers', i) ? '?' : f.value }}
        </button>
      </div>
    </div>
    <p class="muted hint">Toque na figura de som para ouvir quantas delas cabem numa semibreve.</p>
  </div>
</template>

<style scoped>
.ftable {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tools {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.tools button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  border: 2px solid var(--border);
  border-radius: var(--r-sm);
  background: var(--surface);
  font-weight: 800;
  font-size: 13px;
  color: var(--muted);
}

.tools button.on {
  border-color: var(--primary);
  background: var(--primary-soft);
  color: var(--primary-dark);
}

.grid {
  border: 2px solid var(--border);
  border-radius: var(--r-md);
  overflow: hidden;
  background: var(--surface);
}

.row {
  display: grid;
  grid-template-columns: 54px 1fr 54px 1.2fr 46px;
  align-items: stretch;
  border-top: 2px solid var(--border);
  transition: background 0.15s;
}

@media (min-width: 560px) {
  .row {
    grid-template-columns: 84px 1fr 84px 1.3fr 70px;
  }
}

.row.head {
  border-top: 0;
  background: var(--surface-2);
}

.row.head span {
  padding: 8px 4px;
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--primary-dark);
  text-align: center;
  line-height: 1.2;
  align-self: center;
}

.row.active {
  background: var(--primary-soft);
}

.cell {
  position: relative;
  border: 0;
  background: transparent;
  min-height: 70px;
  display: grid;
  place-items: center;
  padding: 6px 4px;
  font-weight: 800;
  font-size: 14px;
  text-align: center;
  line-height: 1.2;
  border-radius: 0;
}

@media (min-width: 560px) {
  .cell {
    font-size: 16px;
  }
}

.cell.small {
  font-size: 12px;
  color: var(--muted);
}

@media (min-width: 560px) {
  .cell.small {
    font-size: 14px;
  }
}

.cell.fig:hover {
  background: var(--surface-2);
}

.spk {
  position: absolute;
  right: 4px;
  bottom: 4px;
  color: var(--primary);
}

.cell.num {
  font-size: 22px;
  font-weight: 900;
  color: var(--primary-dark);
}

.cell.masked {
  color: var(--primary);
  font-size: 22px;
  font-weight: 900;
  background: var(--primary-soft);
  cursor: pointer;
  outline: 2px dashed color-mix(in srgb, var(--primary) 40%, transparent);
  outline-offset: -6px;
}

.hint {
  font-size: 13px;
  text-align: center;
}
</style>
