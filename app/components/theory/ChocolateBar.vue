<script setup lang="ts">
// Analogia do chocolate: a semibreve é a barra inteira; cada figura seguinte é a barra quebrada ao meio.
import { Minus, Plus, Play } from 'lucide-vue-next'

const level = ref(0)
const fig = computed(() => FIGURES[level.value]!)
const COLS = [1, 2, 2, 4, 4, 8, 8]
const ROWS = [1, 1, 2, 2, 4, 4, 8]
const cols = computed(() => COLS[level.value]!)
const rows = computed(() => ROWS[level.value]!)
const pieces = computed(() => cols.value * rows.value)
const bump = ref(0)
const { scheduleNote, sfx } = useAudio()

function breakIt() {
  if (level.value >= 6) return
  level.value++
  bump.value++
  sfx.tap()
}

function join() {
  if (level.value <= 0) return
  level.value--
  bump.value++
  sfx.tap()
}

function listen() {
  const n = fig.value.value
  const each = 2.4 / n
  for (let k = 0; k < n; k++) scheduleNote(67, k * each, Math.max(0.03, each * 0.85), n > 16 ? 0.14 : 0.2)
}

const plural = (f: { name: string }, n: number) => (n === 1 ? f.name : `${f.name}s`)
</script>

<template>
  <div class="choco-card">
    <div class="equation">
      <span class="one">1 semibreve</span>
      <span class="eq">=</span>
      <span class="many" :key="level"><strong>{{ fig.value }}</strong> {{ plural(fig, fig.value) }}</span>
    </div>

    <div class="bar-wrap">
      <div
        :key="bump"
        class="bar"
        :style="{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)`, gap: level > 4 ? '3px' : '5px' }"
      >
        <div v-for="p in pieces" :key="p" class="piece" :style="{ animationDelay: `${Math.min(p, 16) * 0.015}s` }">
          <MusicFigureIcon v-if="pieces <= 8" kind="note" :value="fig.value" :size="pieces <= 2 ? 64 : 36" class="on-choco" />
        </div>
      </div>
    </div>

    <p class="caption">
      <template v-if="level === 0">A barra inteira é a <strong>semibreve</strong>. Quebre ao meio!</template>
      <template v-else>
        Cada pedaço é uma <strong>{{ fig.name }}</strong>: metade de uma {{ FIGURES[level - 1]!.name }}.
        Cabem <strong>{{ fig.value }}</strong> numa semibreve.
      </template>
    </p>

    <div class="controls">
      <button class="btn btn-ghost ctrl" :disabled="level === 0" aria-label="Juntar os pedaços" @click="join">
        <Minus :size="20" :stroke-width="3" /> Juntar
      </button>
      <button class="btn btn-ghost ctrl icon" aria-label="Ouvir" @click="listen"><Play :size="18" fill="currentColor" /></button>
      <button class="btn ctrl" :disabled="level === 6" @click="breakIt">
        <Plus :size="20" :stroke-width="3" /> Quebrar ao meio
      </button>
    </div>

    <div class="ladder">
      <button
        v-for="(f, i) in FIGURES"
        :key="f.value"
        class="step"
        :class="{ on: i === level }"
        @click="level = i"
      >
        <span class="n">{{ f.value }}</span>
        <span class="nm">{{ f.name }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.choco-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: var(--r-md);
}

.equation {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 18px;
  font-weight: 800;
}

.one {
  color: var(--muted);
}

.eq {
  color: var(--faint);
}

.many {
  color: var(--primary-dark);
  animation: pop-in 0.35s ease;
}

.many strong {
  font-size: 26px;
}

.bar-wrap {
  width: 100%;
  max-width: 440px;
  margin: 0 auto;
  padding: 10px;
  border-radius: var(--r-md);
  background: #f3e9e1;
}

.bar {
  aspect-ratio: 2 / 1;
  display: grid;
  padding: 6px;
  border-radius: var(--r-sm);
  background: #6f4a35;
  box-shadow: 0 5px 0 #573927;
}

.piece {
  display: grid;
  place-items: center;
  background: #9a6a4f;
  border-radius: 4px;
  box-shadow:
    inset 0 3px 0 #b07f63,
    inset 0 -3px 0 #84583f;
  corner-shape: round;
  animation: pop-in 0.35s cubic-bezier(0.3, 1.5, 0.5, 1) both;
}

.on-choco {
  color: #fff6ef;
}

.caption {
  text-align: center;
  font-size: 15px;
  min-height: 46px;
}

.controls {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.ctrl {
  min-height: 46px;
  padding: 10px 14px;
  font-size: 13px;
}

.ctrl.icon {
  padding: 10px 14px;
}

.ladder {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  padding: 6px 2px;
  border: 2px solid var(--border);
  background: var(--surface);
  border-radius: var(--r-xs);
  color: var(--muted);
}

.step .n {
  font-weight: 900;
  font-size: 16px;
}

.step .nm {
  font-size: 9px;
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

@media (min-width: 560px) {
  .step .nm {
    font-size: 11px;
  }
}

.step.on {
  border-color: var(--primary);
  background: var(--primary-soft);
  color: var(--primary-dark);
}
</style>
