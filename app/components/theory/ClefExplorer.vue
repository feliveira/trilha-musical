<script setup lang="ts">
import { Play } from 'lucide-vue-next'
import type { Clef } from '#shared/types'

interface ClefInfo {
  clef: Clef
  name: string
  line: string
  range: string
  /** Escala de Dó a Dó, em posições da pauta */
  scale: number[]
  instruments: string[]
}

const CLEFS: ClefInfo[] = [
  {
    clef: 'treble',
    name: 'Sol',
    line: '2ª linha',
    range: 'Sons agudos',
    scale: [-2, -1, 0, 1, 2, 3, 4, 5],
    instruments: ['Violino', 'Flauta', 'Oboé', 'Clarinete', 'Saxofones', 'Trompete', 'Trompa'],
  },
  {
    clef: 'alto',
    name: 'Dó',
    line: '3ª linha',
    range: 'Sons médios',
    scale: [-3, -2, -1, 0, 1, 2, 3, 4],
    instruments: ['Viola'],
  },
  {
    clef: 'bass',
    name: 'Fá',
    line: '4ª linha',
    range: 'Sons graves',
    scale: [3, 4, 5, 6, 7, 8, 9, 10],
    instruments: ['Violoncelo', 'Fagote', 'Trombone', 'Tuba'],
  },
]

const sel = ref(0)
const info = computed(() => CLEFS[sel.value]!)
const active = ref<number | null>(null)
const { playMidi } = useAudio()
let timers: ReturnType<typeof setTimeout>[] = []

const lineIndex = computed(() => CLEF_REFERENCE_POS[info.value.clef] / 2 + 1)
const spec = computed(() => ({
  clef: info.value.clef,
  notes: info.value.scale,
  labels: true,
  highlight: { kind: 'line' as const, index: lineIndex.value },
}))

function select(i: number) {
  stop()
  sel.value = i
}

function stop() {
  timers.forEach(clearTimeout)
  timers = []
  active.value = null
}

function onPlay(i: number) {
  active.value = i
  timers.push(setTimeout(() => active.value === i && (active.value = null), 350))
}

function playScale() {
  stop()
  info.value.scale.forEach((p, i) => {
    timers.push(
      setTimeout(() => {
        playMidi(diatonicToMidi(diatonicAt(info.value.clef, p)), 0.5)
        onPlay(i)
      }, i * 320),
    )
  })
}

onBeforeUnmount(stop)
</script>

<template>
  <div class="explorer">
    <div class="tabs">
      <button v-for="(c, i) in CLEFS" :key="c.clef" :class="{ on: sel === i }" @click="select(i)">
        <span class="glyph music">{{ CLEF_GLYPH[c.clef] }}</span>
        <span>{{ c.name }}</span>
      </button>
    </div>

    <div class="facts">
      <span class="chip">Clave de {{ info.name.toLowerCase() }}</span>
      <span class="chip ref">Referência: {{ info.line }}</span>
      <span class="chip">{{ info.range }}</span>
    </div>

    <StaffSvg :key="info.clef" :spec="spec" interactive :active-index="active" @play="onPlay" />

    <button class="btn btn-ghost play" @click="playScale"><Play :size="18" fill="currentColor" /> Ouvir a escala</button>

    <div class="inst">
      <p class="inst-title">Usada por</p>
      <div class="inst-list">
        <span v-for="n in info.instruments" :key="n" class="chip">{{ n }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.explorer {
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
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.tabs button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  padding: 8px 6px 10px;
  border: 2px solid var(--border);
  background: var(--surface);
  border-radius: var(--r-md);
  box-shadow: 0 3px 0 var(--border);
  font-weight: 900;
  color: var(--muted);
}

.tabs button.on {
  border-color: var(--primary);
  background: var(--primary-soft);
  color: var(--primary);
  box-shadow: 0 3px 0 color-mix(in srgb, var(--primary) 50%, var(--border));
}

.glyph {
  font-size: 34px;
  line-height: 1.2;
  height: 44px;
  display: flex;
  align-items: center;
}

.facts {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip.ref {
  background: var(--primary-soft);
  color: var(--primary);
}

.play {
  align-self: center;
  min-height: 46px;
  font-size: 14px;
}

.inst-title {
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted);
  margin-bottom: 6px;
}

.inst-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
</style>
