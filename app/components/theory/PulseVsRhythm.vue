<script setup lang="ts">
// Pulsação (batida constante) × ritmo (sons longos, curtos e silêncios sobre a pulsação).
import { Heart, TriangleAlert, Play, Square } from 'lucide-vue-next'

const { scheduleNote, scheduleClick } = useAudio()

const BEATS = 8
const BEAT = 0.6 // segundos (100 bpm)
// ritmo em tempos: [início, duração, som?]
const RHYTHM: { start: number; len: number; rest?: boolean }[] = [
  { start: 0, len: 1 },
  { start: 1, len: 0.5 },
  { start: 1.5, len: 0.5 },
  { start: 2, len: 2 },
  { start: 4, len: 0.5 },
  { start: 4.5, len: 0.5 },
  { start: 5, len: 1, rest: true },
  { start: 6, len: 2 },
]

const mode = ref<'pulse' | 'rhythm' | 'both' | null>(null)
const beat = ref(-1)
const seg = ref(-1)
let timers: ReturnType<typeof setTimeout>[] = []

function stop() {
  timers.forEach(clearTimeout)
  timers = []
  mode.value = null
  beat.value = -1
  seg.value = -1
}

function play(m: 'pulse' | 'rhythm' | 'both') {
  if (mode.value === m) return stop()
  stop()
  mode.value = m
  const t0 = 0.15
  if (m !== 'rhythm') {
    for (let b = 0; b < BEATS; b++) {
      scheduleClick(t0 + b * BEAT, b % 4 === 0)
      timers.push(setTimeout(() => (beat.value = b), (t0 + b * BEAT) * 1000))
    }
  }
  if (m !== 'pulse') {
    RHYTHM.forEach((r, i) => {
      if (!r.rest) scheduleNote(67, t0 + r.start * BEAT, r.len * BEAT * 0.9)
      timers.push(setTimeout(() => (seg.value = i), (t0 + r.start * BEAT) * 1000))
    })
  }
  timers.push(setTimeout(stop, (t0 + BEATS * BEAT) * 1000 + 200))
}

onBeforeUnmount(stop)
</script>

<template>
  <div class="pulse-card">
    <div class="examples">
      <div class="ex">
        <Heart :size="34" class="heart" fill="currentColor" />
        <p><strong>Batidas do coração</strong><br><span class="muted">sempre no mesmo intervalo</span></p>
      </div>
      <div class="ex">
        <span class="hazard"><TriangleAlert :size="30" :stroke-width="2.6" /></span>
        <p><strong>Pisca-alerta do carro</strong><br><span class="muted">liga e desliga num ritmo constante</span></p>
      </div>
    </div>

    <div class="timeline">
      <p class="row-label">Pulsação</p>
      <div class="pulse-row">
        <span v-for="b in BEATS" :key="b" class="dot" :class="{ on: beat === b - 1 }" />
      </div>
      <p class="row-label">Ritmo</p>
      <div class="rhythm-row">
        <span
          v-for="(r, i) in RHYTHM"
          :key="i"
          class="blk"
          :class="{ rest: r.rest, on: seg === i }"
          :style="{ gridColumn: `${r.start * 2 + 1} / span ${r.len * 2}` }"
        >{{ r.rest ? 'silêncio' : r.len >= 2 ? 'longo' : r.len < 1 ? 'curto' : '' }}</span>
      </div>
    </div>

    <div class="controls">
      <button class="btn btn-ghost c" @click="play('pulse')">
        <component :is="mode === 'pulse' ? Square : Play" :size="16" fill="currentColor" /> Pulsação
      </button>
      <button class="btn btn-ghost c" @click="play('rhythm')">
        <component :is="mode === 'rhythm' ? Square : Play" :size="16" fill="currentColor" /> Ritmo
      </button>
      <button class="btn c" @click="play('both')">
        <component :is="mode === 'both' ? Square : Play" :size="16" fill="currentColor" /> Os dois
      </button>
    </div>
  </div>
</template>

<style scoped>
.pulse-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: var(--r-md);
}

.examples {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.ex {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: var(--r-sm);
  background: var(--surface-2);
  font-size: 13px;
  line-height: 1.35;
}

.heart {
  flex: none;
  color: var(--danger);
  animation: heartbeat 0.83s ease-in-out infinite;
}

@keyframes heartbeat {
  0%,
  100% {
    transform: scale(1);
  }
  15% {
    transform: scale(1.22);
  }
  30% {
    transform: scale(1);
  }
}

.hazard {
  flex: none;
  color: var(--flame);
  animation: blink 1.2s steps(1) infinite;
}

@keyframes blink {
  50% {
    opacity: 0.15;
  }
}

.timeline {
  display: grid;
  grid-template-columns: 70px 1fr;
  align-items: center;
  gap: 10px 8px;
}

.row-label {
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--muted);
}

.pulse-row {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  justify-items: center;
}

.dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  corner-shape: round;
  background: var(--locked);
  transition: transform 0.1s, background 0.1s;
}

.dot.on {
  background: var(--primary);
  transform: scale(1.3);
}

.rhythm-row {
  display: grid;
  grid-template-columns: repeat(16, 1fr);
  gap: 3px;
}

.blk {
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: var(--r-xs);
  background: var(--primary-fill);
  color: var(--on-primary);
  font-size: 10px;
  font-weight: 800;
  overflow: hidden;
  transition: background 0.1s;
}

.blk.rest {
  background: transparent;
  border: 2px dashed var(--border-strong);
  color: var(--faint);
}

.blk.on {
  background: var(--primary);
  color: #fff;
}

.blk.rest.on {
  background: var(--surface-2);
  color: var(--muted);
}

.controls {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.c {
  min-height: 44px;
  padding: 8px 14px;
  font-size: 13px;
}
</style>
