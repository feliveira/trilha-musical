<script setup lang="ts">
import type { StaffSpec } from '#shared/types'

const props = withDefaults(
  defineProps<{
    spec: StaffSpec
    interactive?: boolean
    activeIndex?: number | null
    /** Rótulos nos números das linhas/espaços (para a aula de pentagrama) */
    numbering?: 'lines' | 'spaces' | null
    maxWidth?: number
  }>(),
  { interactive: false, activeIndex: null, numbering: null, maxWidth: 520 },
)
const emit = defineEmits<{ play: [index: number] }>()
const { playMidi } = useAudio()

const GAP = 12 // distância entre linhas
const HALF = GAP / 2
const STEM = 36

const clef = computed(() => props.spec.clef)
const notes = computed(() => props.spec.notes ?? [])

const startX = computed(() => (clef.value ? 70 : props.numbering ? 46 : 26))
const lineX = computed(() => (props.numbering ? 30 : 4))
const spacing = computed(() => (notes.value.length > 6 ? 38 : 46))
const width = computed(() => {
  const n = notes.value.length
  const content = n ? startX.value + n * spacing.value + 14 : startX.value + 60
  return Math.max(content, clef.value && !n ? 150 : props.numbering ? 260 : 200)
})

// y = 0 na 1ª linha; positivo para baixo
const yOf = (pos: number) => -pos * HALF

const stemUp = (pos: number) => pos < 4
const noteX = (i: number) => startX.value + spacing.value * i + spacing.value / 2

function ledgers(pos: number) {
  const out: number[] = []
  if (pos <= -2) for (let l = -2; l >= pos; l -= 2) out.push(l)
  if (pos >= 10) for (let l = 10; l <= pos; l += 2) out.push(l)
  return out
}

const bounds = computed(() => {
  let top = yOf(8) - 10
  let bottom = 10
  if (clef.value) {
    top = Math.min(top, yOf(8) - (clef.value === 'treble' ? 20 : 4))
    bottom = Math.max(bottom, clef.value === 'treble' ? 24 : 4)
  }
  for (const p of notes.value) {
    const y = yOf(p)
    top = Math.min(top, stemUp(p) ? y - STEM - 2 : y - 8)
    bottom = Math.max(bottom, stemUp(p) ? y + 8 : y + STEM + 2)
  }
  if (props.spec.labels) bottom += 26
  return { top: top - 6, bottom: bottom + 6 }
})

const viewBox = computed(() => `0 ${bounds.value.top} ${width.value} ${bounds.value.bottom - bounds.value.top}`)
const labelY = computed(() => bounds.value.bottom - 12)

const highlightRect = computed(() => {
  const h = props.spec.highlight
  if (!h) return null
  const pos = h.kind === 'line' ? (h.index - 1) * 2 : (h.index - 1) * 2 + 1
  return { kind: h.kind, y: yOf(pos) }
})

function nameAt(pos: number) {
  return noteNameOf(diatonicAt(clef.value ?? 'treble', pos))
}

function play(i: number) {
  if (!props.interactive) return
  const pos = notes.value[i]!
  playMidi(diatonicToMidi(diatonicAt(clef.value ?? 'treble', pos)))
  emit('play', i)
}

// Linha de base do símbolo da clave, calibrada para a fonte Noto Music (48px = altura da pauta):
// sol envolve a 2ª linha, dó fica centrada na 3ª e os pontos da fá cercam a 4ª.
const CLEF_BASELINE_OFFSET = { treble: 12, alto: 24, bass: 31.5 } as const
const clefY = computed(() =>
  clef.value ? yOf(CLEF_REFERENCE_POS[clef.value]) + CLEF_BASELINE_OFFSET[clef.value] : 0,
)
</script>

<template>
  <svg
    class="staff"
    :viewBox="viewBox"
    :style="{ maxWidth: `${Math.min(maxWidth, width * 1.7)}px` }"
    role="img"
    :aria-label="clef ? CLEF_NAME[clef] : 'Pentagrama'"
  >
    <!-- destaque de espaço -->
    <rect
      v-if="highlightRect?.kind === 'space'"
      :x="lineX"
      :y="highlightRect.y - HALF"
      :width="width - lineX - 4"
      :height="GAP"
      rx="3"
      class="hl-space"
    />

    <!-- linhas -->
    <line
      v-for="l in 5"
      :key="l"
      :x1="lineX"
      :x2="width - 4"
      :y1="yOf((l - 1) * 2)"
      :y2="yOf((l - 1) * 2)"
      class="line"
      :class="{ hl: highlightRect?.kind === 'line' && highlightRect.y === yOf((l - 1) * 2) }"
    />

    <!-- numeração -->
    <template v-if="numbering === 'lines'">
      <text v-for="l in 5" :key="`ln${l}`" x="16" :y="yOf((l - 1) * 2) + 3.5" class="num">{{ l }}</text>
    </template>
    <template v-if="numbering === 'spaces'">
      <text v-for="s in 4" :key="`sp${s}`" x="16" :y="yOf((s - 1) * 2 + 1) + 3.5" class="num sp">{{ s }}</text>
    </template>

    <!-- clave -->
    <text v-if="clef" :x="clef === 'treble' ? 10 : 12" :y="clefY" class="clef music" :class="clef">{{ CLEF_GLYPH[clef] }}</text>

    <!-- notas -->
    <g
      v-for="(p, i) in notes"
      :key="i"
      class="note"
      :class="{ active: activeIndex === i, clickable: interactive }"
      @click="play(i)"
    >
      <line
        v-for="l in ledgers(p)"
        :key="l"
        :x1="noteX(i) - 12"
        :x2="noteX(i) + 12"
        :y1="yOf(l)"
        :y2="yOf(l)"
        class="ledger"
      />
      <ellipse :cx="noteX(i)" :cy="yOf(p)" rx="7.2" ry="5.1" :transform="`rotate(-20 ${noteX(i)} ${yOf(p)})`" class="head" />
      <line
        v-if="stemUp(p)"
        :x1="noteX(i) + 6.4"
        :x2="noteX(i) + 6.4"
        :y1="yOf(p) - 1"
        :y2="yOf(p) - STEM"
        class="stem"
      />
      <line v-else :x1="noteX(i) - 6.4" :x2="noteX(i) - 6.4" :y1="yOf(p) + 1" :y2="yOf(p) + STEM" class="stem" />
      <rect
        v-if="interactive"
        :x="noteX(i) - spacing / 2"
        :y="bounds.top"
        :width="spacing"
        :height="bounds.bottom - bounds.top"
        class="hit"
      />
      <text v-if="spec.labels" :x="noteX(i)" :y="labelY" class="label">{{ nameAt(p) }}</text>
    </g>
  </svg>
</template>

<style scoped>
.staff {
  width: 100%;
  height: auto;
  display: block;
  margin: 0 auto;
  overflow: visible;
  color: var(--text);
}

.line,
.ledger {
  stroke: currentColor;
  stroke-width: 1.2;
}

.line.hl {
  stroke: var(--primary);
  stroke-width: 3;
}

.hl-space {
  fill: var(--primary-soft);
  stroke: var(--primary);
  stroke-width: 1;
  stroke-dasharray: 3 3;
}

.num {
  font-size: 10px;
  font-weight: 900;
  fill: var(--primary);
  text-anchor: middle;
}

.num.sp {
  fill: var(--muted);
}

.clef {
  font-size: 48px;
  fill: currentColor;
}

.head {
  fill: currentColor;
}

.stem {
  stroke: currentColor;
  stroke-width: 1.5;
}

.note {
  transition: color 0.15s;
}

.note.clickable {
  cursor: pointer;
}

.note.clickable:hover,
.note.active {
  color: var(--primary);
}

.note.active .head {
  animation: note-pop 0.35s ease;
  transform-box: fill-box;
  transform-origin: center;
}

@keyframes note-pop {
  50% {
    scale: 1.35;
  }
}

.hit {
  fill: transparent;
}

.label {
  font-size: 11px;
  font-weight: 800;
  fill: var(--muted);
  text-anchor: middle;
}

.note.active .label {
  fill: var(--primary);
}
</style>
