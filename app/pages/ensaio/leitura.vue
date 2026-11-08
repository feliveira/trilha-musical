<script setup lang="ts">
import { X, Timer, Zap } from 'lucide-vue-next'
import type { Clef } from '#shared/types'
import { LEITURA_SECONDS } from '#shared/utils/games'
import { gameMeta } from '~/data/games'

definePageMeta({ layout: 'focus' })

const route = useRoute()
const meta = gameMeta('leitura')
const mode = computed(() => (['sol', 'fa', 'do'].includes(String(route.query.modo)) ? String(route.query.modo) : 'sol'))
const CLEF: Record<string, Clef> = { sol: 'treble', fa: 'bass', do: 'alto' }
const clef = computed(() => CLEF[mode.value]!)
const modeLabel = computed(() => meta.modes.find((m) => m.id === mode.value)!.label)

const { playMidi, sfx } = useAudio()
const { streak } = useUser()
const { outcome, finish, reset } = useGameSubmit('leitura', mode)

const phase = ref<'ready' | 'countdown' | 'playing' | 'saving' | 'done'>('ready')
const count = ref(3)
const pos = ref(4)
const score = ref(0)
const misses = ref(0)
const combo = ref(0)
const remaining = ref(LEITURA_SECONDS)
const feedback = ref<{ idx: number; ok: boolean } | null>(null)
const reveal = ref<number | null>(null)
let tick: ReturnType<typeof setInterval> | null = null
let endAt = 0
let locked = false

const MIN_POS = -2
const MAX_POS = 10

function nextNote() {
  let p = pos.value
  while (p === pos.value) p = MIN_POS + Math.floor(Math.random() * (MAX_POS - MIN_POS + 1))
  pos.value = p
}

const correctIdx = computed(() => {
  const d = diatonicAt(clef.value, pos.value)
  return ((d % 7) + 7) % 7
})

function begin() {
  score.value = 0
  misses.value = 0
  combo.value = 0
  remaining.value = LEITURA_SECONDS
  reset()
  phase.value = 'countdown'
  count.value = 3
  sfx.tap()
  const cd = setInterval(() => {
    count.value--
    if (count.value > 0) sfx.tap()
    if (count.value <= 0) {
      clearInterval(cd)
      startPlaying()
    }
  }, 700)
}

function startPlaying() {
  nextNote()
  phase.value = 'playing'
  endAt = Date.now() + LEITURA_SECONDS * 1000
  tick = setInterval(() => {
    remaining.value = Math.max(0, (endAt - Date.now()) / 1000)
    if (remaining.value <= 0) end()
  }, 100)
}

async function end() {
  if (tick) clearInterval(tick)
  tick = null
  phase.value = 'saving'
  sfx.complete()
  await finish(score.value)
  phase.value = 'done'
}

function answer(i: number) {
  if (phase.value !== 'playing' || locked) return
  if (i === correctIdx.value) {
    score.value++
    combo.value++
    feedback.value = { idx: i, ok: true }
    playMidi(diatonicToMidi(diatonicAt(clef.value, pos.value)), 0.4)
    locked = true
    setTimeout(() => {
      feedback.value = null
      locked = false
      nextNote()
    }, 160)
  } else {
    misses.value++
    combo.value = 0
    feedback.value = { idx: i, ok: false }
    reveal.value = correctIdx.value
    sfx.wrong()
    locked = true
    setTimeout(() => {
      feedback.value = null
      reveal.value = null
      locked = false
      nextNote()
    }, 650)
  }
}

function onKey(e: KeyboardEvent) {
  if (phase.value === 'ready' && e.key === 'Enter') return begin()
  const n = Number(e.key)
  if (n >= 1 && n <= 7) answer(n - 1)
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  if (tick) clearInterval(tick)
})

const spec = computed(() => ({ clef: clef.value, notes: [pos.value] }))
const timePct = computed(() => remaining.value / LEITURA_SECONDS)
</script>

<template>
  <GameResult
    v-if="phase === 'done' && outcome"
    :title="`${meta.title} · ${modeLabel}`"
    :score="outcome.score"
    score-label="notas certas"
    :best="outcome.best"
    :xp-gain="outcome.xpGain"
    :new-best="outcome.newBest"
    :streak-up="outcome.streakUp"
    :streak="streak"
    :saved="outcome.saved"
    @retry="begin"
    @exit="navigateTo('/ensaio')"
  />

  <template v-else>
    <div class="bar">
      <button class="icon-btn" aria-label="Sair" @click="navigateTo('/ensaio')"><X :size="26" :stroke-width="2.6" /></button>
      <div class="progress timer" :class="{ low: remaining < 10 }">
        <span :style="{ width: `${timePct * 100}%` }" />
      </div>
      <span class="clock"><Timer :size="18" /> {{ Math.ceil(remaining) }}s</span>
    </div>

    <main class="stage">
      <!-- Tela inicial -->
      <div v-if="phase === 'ready'" class="intro rise-in">
        <span class="icon"><Zap :size="40" :stroke-width="2.4" /></span>
        <h1>{{ meta.title }}</h1>
        <p class="chip">{{ modeLabel }}</p>
        <p class="muted">Identifique o nome de cada nota o mais rápido que puder. Você tem <strong>{{ LEITURA_SECONDS }} segundos</strong>.</p>
        <StaffSvg :spec="{ clef, notes: [] }" :max-width="200" />
        <button class="btn btn-block" @click="begin">Começar</button>
        <p class="muted small">No computador, use as teclas 1 a 7.</p>
      </div>

      <div v-else-if="phase === 'countdown'" class="countdown">
        <span :key="count" class="pop-in">{{ count }}</span>
      </div>

      <template v-else>
        <div class="hud">
          <span class="score"><strong>{{ score }}</strong> certas</span>
          <span v-if="combo >= 3" class="combo pop-in">{{ combo }} seguidas!</span>
        </div>
        <div class="staff-card" :class="{ ok: feedback?.ok, bad: feedback && !feedback.ok }">
          <StaffSvg :key="pos" :spec="spec" :max-width="320" />
        </div>
        <div class="answers">
          <button
            v-for="(n, i) in NOTE_NAMES"
            :key="n"
            class="ans"
            :class="{
              ok: feedback?.idx === i && feedback.ok,
              bad: feedback?.idx === i && !feedback.ok,
              reveal: reveal === i,
            }"
            :disabled="phase !== 'playing'"
            @click="answer(i)"
          >
            <span class="k">{{ i + 1 }}</span>{{ n }}
          </button>
        </div>
      </template>
    </main>
  </template>
</template>

<style scoped>
.bar {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: 16px 16px 8px;
}

.timer {
  flex: 1;
}

.timer > span {
  transition: width 0.1s linear;
}

.timer.low > span {
  background: var(--danger);
}

.clock {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 56px;
  font-weight: 900;
  color: var(--muted);
}

.stage {
  flex: 1;
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
  padding: 16px 16px 32px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.intro {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  margin-top: 16px;
}

.intro .icon {
  width: 84px;
  height: 84px;
  display: grid;
  place-items: center;
  border-radius: var(--r-lg);
  background: var(--fam-3);
  color: var(--on-primary);
  box-shadow: 0 5px 0 color-mix(in srgb, var(--on-primary) 25%, var(--fam-3));
}

.intro h1 {
  font-size: 28px;
}

.chip {
  background: var(--primary-soft);
  color: var(--primary-dark);
}

.small {
  font-size: 13px;
}

.countdown {
  flex: 1;
  display: grid;
  place-items: center;
  min-height: 50vh;
}

.countdown span {
  font-size: 120px;
  font-weight: 900;
  color: var(--primary);
}

.hud {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 32px;
}

.score {
  font-size: 18px;
  color: var(--muted);
  font-weight: 800;
}

.score strong {
  font-size: 28px;
  color: var(--primary-dark);
}

.combo {
  padding: 4px 12px;
  border-radius: var(--r-sm);
  background: var(--flame-fill);
  color: var(--on-flame);
  font-weight: 900;
}

.staff-card {
  padding: 18px 12px;
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: var(--r-lg);
  transition: border-color 0.12s, background 0.12s;
}

.staff-card.ok {
  border-color: var(--success);
  background: var(--success-soft);
}

.staff-card.bad {
  border-color: var(--danger);
  background: var(--danger-soft);
  animation: shake 0.4s ease;
}

.answers {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

@media (min-width: 560px) {
  .answers {
    grid-template-columns: repeat(7, 1fr);
  }
}

.ans {
  position: relative;
  min-height: 64px;
  border: 2px solid var(--border);
  background: var(--surface);
  border-radius: var(--r-md);
  box-shadow: 0 4px 0 var(--border);
  font-size: 18px;
  font-weight: 900;
  transition: transform 0.06s, box-shadow 0.06s;
  margin-bottom: 4px;
}

.ans:active:not(:disabled) {
  transform: translateY(4px);
  box-shadow: none;
}

.k {
  position: absolute;
  top: 4px;
  left: 6px;
  font-size: 10px;
  color: var(--faint);
}

.ans.ok {
  border-color: var(--success);
  background: var(--success-fill);
  color: var(--on-success);
  box-shadow: 0 4px 0 var(--success-shadow);
}

.ans.bad {
  border-color: var(--danger);
  background: var(--danger-fill);
  color: var(--on-danger);
  box-shadow: 0 4px 0 var(--danger-shadow);
}

.ans.reveal {
  border-color: var(--success);
  background: var(--success-soft);
  color: var(--success-dark);
}
</style>
