<script setup lang="ts">
// Pauta com figuras, fórmula de compasso e barras — pode tocar o trecho com metrônomo.
import { Play, Square } from 'lucide-vue-next'
import type { RhythmSpec } from '#shared/types'

const props = withDefaults(
  defineProps<{
    spec: RhythmSpec
    playable?: boolean
    metronome?: boolean
    bpm?: number
    maxWidth?: number
  }>(),
  { playable: false, metronome: false, bpm: 76, maxWidth: 640 },
)

const { scheduleNote, scheduleClick } = useAudio()

const HALF = 6
const yOf = (p: number) => -p * HALF
const single = computed(() => !!props.spec.singleLine)
const defaultPos = computed(() => (single.value ? 4 : 3))
const CLEF_OFFSET = { treble: 12, alto: 24, bass: 31.5 } as const

interface Laid {
  i: number
  t: string
  x: number
  pos?: number
  count?: string
}

const layout = computed(() => {
  let x = 8
  const clefX = x
  if (props.spec.clef) x += 52
  const sigX = x + 12
  if (props.spec.timeSig) x += 30
  x += 6

  const items: Laid[] = []
  const labels: { x: number; text: string }[] = []
  const bars: { x: number; style: string }[] = []
  let beat = 0
  const perBar = props.spec.timeSig?.[0] ?? 4

  props.spec.items.forEach((it, i) => {
    if (it.t === 'label') {
      labels.push({ x: x + 2, text: it.text })
      return
    }
    if (it.t === 'bar') {
      bars.push({ x: x + 4, style: it.style })
      x += it.style === 'single' ? 14 : 18
      beat = 0
      return
    }
    const beats = figureInfo(it.v).beats
    const w = 28 + Math.min(beats, 4) * 9
    let count: string | undefined
    if (props.spec.counts && Number.isInteger(beat)) {
      const n = Math.max(1, Math.round(beats))
      count = Array.from({ length: n }, (_, k) => ((beat + k) % perBar) + 1).join('-')
    }
    items.push({ i, t: it.t, x: x + 12, pos: it.t === 'note' ? (it.pos ?? defaultPos.value) : undefined, count })
    beat += beats
    x += w
  })
  return { clefX, sigX, items, labels, bars, width: Math.max(x + 6, 120) }
})

const width = computed(() => layout.value.width)

const bounds = computed(() => {
  let top = yOf(8) - 10
  let bottom = yOf(0) + 10
  if (props.spec.clef) {
    top = Math.min(top, yOf(8) - 20)
    bottom = Math.max(bottom, 24)
  }
  for (const it of layout.value.items) {
    if (it.t !== 'note') continue
    const y = yOf(it.pos!)
    const up = single.value || it.pos! < 4
    top = Math.min(top, up ? y - 52 : y - 8)
    bottom = Math.max(bottom, up ? y + 8 : y + 52)
  }
  if (layout.value.labels.length) top -= 22
  if (props.spec.counts) bottom += 22
  return { top: top - 4, bottom: bottom + 4 }
})

const lines = computed(() => (single.value ? [4] : [0, 2, 4, 6, 8]))
const barTop = computed(() => (single.value ? yOf(6) : yOf(8)))
const barBottom = computed(() => (single.value ? yOf(2) : yOf(0)))

// ---------- reprodução ----------
const active = ref<number | null>(null)
const playing = ref(false)
let timers: ReturnType<typeof setTimeout>[] = []

function stop() {
  timers.forEach(clearTimeout)
  timers = []
  playing.value = false
  active.value = null
}

function play() {
  if (playing.value) return stop()
  stop()
  playing.value = true
  const beatSec = 60 / props.bpm
  const clef = props.spec.clef ?? 'treble'
  const perBar = props.spec.timeSig?.[0] ?? 4
  let t = 0.15
  let totalBeats = 0
  for (const it of props.spec.items) {
    if (it.t !== 'note' && it.t !== 'rest') continue
    const beats = figureInfo(it.v).beats
    const dur = beats * beatSec
    const idx = props.spec.items.indexOf(it)
    if (it.t === 'note') {
      const midi = single.value ? 67 : diatonicToMidi(diatonicAt(clef, it.pos ?? defaultPos.value))
      scheduleNote(midi, t, Math.max(0.12, dur * 0.92))
    }
    timers.push(setTimeout(() => (active.value = idx), t * 1000))
    t += dur
    totalBeats += beats
  }
  if (props.metronome) {
    for (let b = 0; b < Math.ceil(totalBeats); b++) scheduleClick(0.15 + b * beatSec, b % perBar === 0)
  }
  timers.push(setTimeout(stop, t * 1000 + 300))
}

onBeforeUnmount(stop)
</script>

<template>
  <div class="rhythm">
    <svg
      class="rstaff"
      :viewBox="`0 ${bounds.top} ${width} ${bounds.bottom - bounds.top}`"
      :style="{ maxWidth: `${Math.min(maxWidth, width * 1.6)}px` }"
      role="img"
      aria-label="Trecho musical"
    >
      <line v-for="p in lines" :key="p" x1="2" :x2="width - 2" :y1="yOf(p)" :y2="yOf(p)" class="line" />

      <text
        v-if="spec.clef"
        :x="layout.clefX + 2"
        :y="yOf(CLEF_REFERENCE_POS[spec.clef]) + CLEF_OFFSET[spec.clef]"
        class="clef music"
      >{{ CLEF_GLYPH[spec.clef] }}</text>

      <template v-if="spec.timeSig">
        <text :x="layout.sigX" :y="yOf(6)" class="sig">{{ spec.timeSig[0] }}</text>
        <text :x="layout.sigX" :y="yOf(2)" class="sig">{{ spec.timeSig[1] }}</text>
      </template>

      <text v-for="(l, i) in layout.labels" :key="`l${i}`" :x="l.x" :y="bounds.top + 14" class="label">{{ l.text }}</text>

      <g v-for="(b, i) in layout.bars" :key="`b${i}`" class="bar">
        <line v-if="b.style === 'single'" :x1="b.x" :x2="b.x" :y1="barTop" :y2="barBottom" class="thin" />
        <template v-else-if="b.style === 'double'">
          <line :x1="b.x" :x2="b.x" :y1="barTop" :y2="barBottom" class="thin" />
          <line :x1="b.x + 5" :x2="b.x + 5" :y1="barTop" :y2="barBottom" class="thin" />
        </template>
        <template v-else>
          <line :x1="b.x" :x2="b.x" :y1="barTop" :y2="barBottom" class="thin" />
          <rect :x="b.x + 4" :y="barTop" width="5" :height="barBottom - barTop" class="thick" />
        </template>
      </g>

      <g v-for="it in layout.items" :key="it.i" :class="['ev', { active: active === it.i }]">
        <template v-if="spec.items[it.i]!.t === 'note'">
          <line
            v-for="l in [it.pos! <= -2 ? -2 : null, it.pos! >= 10 ? 10 : null].filter((v) => v !== null)"
            :key="l!"
            :x1="it.x - 12"
            :x2="it.x + 12"
            :y1="yOf(l!)"
            :y2="yOf(l!)"
            class="line"
          />
          <MusicFigureMark
            kind="note"
            :value="(spec.items[it.i] as any).v"
            :x="it.x"
            :y="yOf(it.pos!)"
            :stem="single || it.pos! < 4 ? 'up' : 'down'"
          />
        </template>
        <MusicFigureMark
          v-else
          kind="rest"
          :value="(spec.items[it.i] as any).v"
          :x="it.x"
          :y="(spec.items[it.i] as any).v === 1 ? yOf(single ? 4 : 6) : yOf(4)"
        />
        <text v-if="it.count" :x="it.x" :y="bounds.bottom - 8" class="count">{{ it.count }}</text>
      </g>
    </svg>

    <button v-if="playable" class="btn btn-ghost play" @click="play">
      <component :is="playing ? Square : Play" :size="18" fill="currentColor" />
      {{ playing ? 'Parar' : 'Ouvir' }}
    </button>
  </div>
</template>

<style scoped>
.rhythm {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.rstaff {
  width: 100%;
  height: auto;
  display: block;
  overflow: visible;
  color: var(--text);
}

.line,
.thin {
  stroke: currentColor;
  stroke-width: 1.2;
}

.thick {
  fill: currentColor;
}

.clef {
  font-size: 48px;
  fill: currentColor;
}

.sig {
  font-size: 27px;
  font-weight: 900;
  fill: currentColor;
  text-anchor: middle;
  dominant-baseline: central;
}

.label {
  font-size: 11px;
  font-weight: 900;
  fill: var(--primary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.count {
  font-size: 11px;
  font-weight: 800;
  fill: var(--muted);
  text-anchor: middle;
}

.ev {
  transition: color 0.12s;
}

.ev.active {
  color: var(--primary);
}

.ev.active .count {
  fill: var(--primary);
}

.play {
  min-height: 44px;
  font-size: 14px;
}
</style>
