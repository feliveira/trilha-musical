<script setup lang="ts">
import type { BarStyle, RhythmSpec } from '#shared/types'

const TYPES: { style: BarStyle; name: string; text: string }[] = [
  { style: 'single', name: 'Barra simples', text: 'Uma linha. Indica o fim de um compasso e o início do seguinte.' },
  { style: 'double', name: 'Barra dupla', text: 'Duas linhas finas. Indica o fim de uma seção da música (ex.: estrofe → coro).' },
  { style: 'final', name: 'Barra final', text: 'Uma fina e uma grossa. Indica o fim do hino ou da peça.' },
]

const sel = ref<BarStyle>('single')

// Barra dupla no fim do compasso: separa a seção E fecha o compasso
const atEnd: RhythmSpec = {
  timeSig: [4, 4],
  items: [
    { t: 'label', text: 'Estrofe' },
    { t: 'note', v: 4 }, { t: 'note', v: 4, pos: 4 }, { t: 'note', v: 2, pos: 5 },
    { t: 'bar', style: 'single' },
    { t: 'note', v: 1, pos: 4 },
    { t: 'bar', style: 'double' },
    { t: 'label', text: 'Coro' },
    { t: 'note', v: 4, pos: 5 }, { t: 'note', v: 4, pos: 4 }, { t: 'note', v: 2, pos: 3 },
    { t: 'bar', style: 'single' },
    { t: 'note', v: 1, pos: 2 },
    { t: 'bar', style: 'final' },
  ],
}

// Barra dupla no meio do compasso: só separa as seções (o compasso continua)
const inMiddle: RhythmSpec = {
  timeSig: [4, 4],
  items: [
    { t: 'label', text: 'Estrofe' },
    { t: 'note', v: 2, pos: 3 }, { t: 'note', v: 4, pos: 4 }, { t: 'note', v: 4, pos: 5 },
    { t: 'bar', style: 'single' },
    { t: 'note', v: 2, pos: 4 }, { t: 'note', v: 4, pos: 3 },
    { t: 'bar', style: 'double' },
    { t: 'label', text: 'Coro' },
    { t: 'note', v: 4, pos: 2 },
    { t: 'bar', style: 'single' },
    { t: 'note', v: 2, pos: 4 }, { t: 'note', v: 2, pos: 3 },
    { t: 'bar', style: 'final' },
  ],
}
</script>

<template>
  <div class="gallery">
    <div class="types">
      <button v-for="t in TYPES" :key="t.style" class="type" :class="{ on: sel === t.style }" @click="sel = t.style">
        <svg viewBox="0 0 40 56" class="bar-icon" aria-hidden="true">
          <line v-for="k in 5" :key="k" x1="0" x2="40" :y1="4 + (k - 1) * 12" :y2="4 + (k - 1) * 12" class="ln" />
          <line v-if="t.style !== 'final'" x1="18" x2="18" y1="4" y2="52" class="bl" />
          <line v-if="t.style === 'double'" x1="24" x2="24" y1="4" y2="52" class="bl" />
          <template v-if="t.style === 'final'">
            <line x1="16" x2="16" y1="4" y2="52" class="bl" />
            <rect x="21" y="4" width="5" height="48" class="bk" />
          </template>
        </svg>
        <span>{{ t.name }}</span>
      </button>
    </div>
    <p class="desc" :key="sel">{{ TYPES.find((t) => t.style === sel)!.text }}</p>

    <div class="example">
      <p class="ex-title">Barra dupla no <strong>fim</strong> do compasso</p>
      <p class="muted ex-text">Separa a estrofe do coro <strong>e</strong> também fecha o compasso (4 tempos antes dela).</p>
      <MusicRhythmStaff :spec="atEnd" playable />
    </div>

    <div class="example">
      <p class="ex-title">Barra dupla no <strong>meio</strong> do compasso</p>
      <p class="muted ex-text">
        Aqui ela só divide as seções: o compasso tem 3 tempos antes da barra dupla e termina com o 1º tempo do coro.
        É o que acontece nos hinos 46 e 54.
      </p>
      <MusicRhythmStaff :spec="inMiddle" playable />
    </div>
  </div>
</template>

<style scoped>
.gallery {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.types {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.type {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 6px;
  border: 2px solid var(--border);
  border-radius: var(--r-md);
  background: var(--surface);
  box-shadow: 0 3px 0 var(--border);
  font-weight: 800;
  font-size: 13px;
  color: var(--muted);
}

.type.on {
  border-color: var(--primary);
  background: var(--primary-soft);
  color: var(--primary-dark);
  box-shadow: 0 3px 0 var(--primary-shadow);
}

.bar-icon {
  width: 40px;
  height: 56px;
  color: var(--text);
}

.ln {
  stroke: currentColor;
  stroke-width: 1;
  opacity: 0.5;
}

.bl {
  stroke: currentColor;
  stroke-width: 1.6;
}

.bk {
  fill: currentColor;
}

.desc {
  text-align: center;
  font-size: 15px;
  animation: rise-in 0.25s ease;
}

.example {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: var(--r-md);
}

.ex-title {
  font-weight: 800;
}

.ex-text {
  font-size: 14px;
  margin-bottom: 4px;
}
</style>
