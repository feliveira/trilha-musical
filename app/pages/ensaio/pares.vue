<script setup lang="ts">
import type { FigureValue } from '#shared/types'
import { PARES_PER_ROUND, PARES_ROUNDS } from '#shared/utils/games'
import { gameMeta } from '~/data/games'

definePageMeta({ layout: 'focus' })

const route = useRoute()
const meta = gameMeta('pares')
const mode = computed(() => (['nome', 'pausa', 'numero'].includes(String(route.query.modo)) ? String(route.query.modo) : 'nome'))
const modeLabel = computed(() => meta.modes.find((m) => m.id === mode.value)!.label)
const TOTAL = PARES_ROUNDS * PARES_PER_ROUND

const { sfx, playMidi } = useAudio()
const { streak } = useUser()
const { outcome, finish, reset } = useGameSubmit('pares', mode)

const phase = ref<'playing' | 'saving' | 'done'>('playing')
const round = ref(0)
const left = ref<FigureValue[]>([])
const right = ref<FigureValue[]>([])
const matched = ref<Set<FigureValue>>(new Set())
const missed = ref<Set<FigureValue>>(new Set())
const selLeft = ref<FigureValue | null>(null)
const selRight = ref<FigureValue | null>(null)
const wrongPair = ref<[FigureValue, FigureValue] | null>(null)
const firstTry = ref(0)
const totalMatched = ref(0)
const startedAt = ref(Date.now())
const elapsed = ref(0)

function newRound() {
  const values = shuffle(FIGURES.map((f) => f.value)).slice(0, PARES_PER_ROUND)
  left.value = shuffle(values)
  right.value = shuffle(values)
  matched.value = new Set()
  missed.value = new Set()
  selLeft.value = null
  selRight.value = null
}

function start() {
  reset()
  round.value = 0
  firstTry.value = 0
  totalMatched.value = 0
  startedAt.value = Date.now()
  phase.value = 'playing'
  newRound()
}

function tryMatch() {
  if (selLeft.value === null || selRight.value === null) return
  const a = selLeft.value
  const b = selRight.value
  if (a === b) {
    matched.value = new Set([...matched.value, a])
    totalMatched.value++
    if (!missed.value.has(a)) firstTry.value++
    playMidi(60 + [0, 2, 4, 5, 7, 9, 11][FIGURES.findIndex((f) => f.value === a)]!, 0.35)
    selLeft.value = null
    selRight.value = null
    if (matched.value.size === left.value.length) setTimeout(endRound, 450)
  } else {
    missed.value = new Set([...missed.value, a])
    wrongPair.value = [a, b]
    sfx.wrong()
    setTimeout(() => {
      wrongPair.value = null
      selLeft.value = null
      selRight.value = null
    }, 450)
  }
}

async function endRound() {
  if (round.value + 1 >= PARES_ROUNDS) {
    elapsed.value = Date.now() - startedAt.value
    phase.value = 'saving'
    sfx.complete()
    await finish(firstTry.value)
    phase.value = 'done'
    return
  }
  round.value++
  sfx.combo()
  newRound()
}

function pickLeft(v: FigureValue) {
  if (matched.value.has(v) || wrongPair.value) return
  sfx.tap()
  selLeft.value = selLeft.value === v ? null : v
  tryMatch()
}

function pickRight(v: FigureValue) {
  if (matched.value.has(v) || wrongPair.value) return
  sfx.tap()
  selRight.value = selRight.value === v ? null : v
  tryMatch()
}

onMounted(start)
</script>

<template>
  <GameResult
    v-if="phase === 'done' && outcome"
    :title="`${meta.title} · ${modeLabel}`"
    :score="outcome.score"
    :max="TOTAL"
    score-label="pares de primeira"
    :best="outcome.best"
    :xp-gain="outcome.xpGain"
    :new-best="outcome.newBest"
    :streak-up="outcome.streakUp"
    :streak="streak"
    :time-ms="elapsed"
    :saved="outcome.saved"
    @retry="start"
    @exit="navigateTo('/ensaio')"
  />

  <template v-else>
    <FocusTopBar :progress="totalMatched / TOTAL" @close="navigateTo('/ensaio')">
      <span class="count">{{ round + 1 }}/{{ PARES_ROUNDS }}</span>
    </FocusTopBar>

    <main class="stage">
      <p class="eyebrow">{{ modeLabel }}</p>
      <h1>Toque em uma figura e depois no seu par</h1>

      <div :key="round" class="board rise-in">
        <div class="col">
          <button
            v-for="v in left"
            :key="`l${v}`"
            class="tile"
            :class="{
              sel: selLeft === v,
              done: matched.has(v),
              bad: wrongPair?.[0] === v,
            }"
            :disabled="matched.has(v)"
            :aria-label="figureInfo(v).name"
            @click="pickLeft(v)"
          >
            <MusicFigureIcon kind="note" :value="v" :size="50" />
          </button>
        </div>
        <div class="col">
          <button
            v-for="v in right"
            :key="`r${v}`"
            class="tile"
            :class="{
              sel: selRight === v,
              done: matched.has(v),
              bad: wrongPair?.[1] === v,
              text: mode !== 'pausa',
              num: mode === 'numero',
            }"
            :disabled="matched.has(v)"
            @click="pickRight(v)"
          >
            <MusicFigureIcon v-if="mode === 'pausa'" kind="rest" :value="v" :size="50" />
            <template v-else-if="mode === 'numero'">{{ v }}</template>
            <template v-else>{{ figureInfo(v).name }}</template>
          </button>
        </div>
      </div>
      <p class="muted score">Pares de primeira: <strong>{{ firstTry }}</strong></p>
    </main>
  </template>
</template>

<style scoped>
.count {
  font-weight: 900;
  color: var(--muted);
  min-width: 44px;
  text-align: right;
}

.stage {
  flex: 1;
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
  padding: 20px 16px 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.eyebrow {
  font-size: 13px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--primary);
}

h1 {
  font-size: 22px;
  margin-top: -8px;
}

.board {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.col {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tile {
  min-height: 74px;
  display: grid;
  place-items: center;
  padding: 6px;
  border: 2px solid var(--border);
  background: var(--surface);
  border-radius: var(--r-md);
  box-shadow: 0 4px 0 var(--border);
  font-weight: 800;
  font-size: 16px;
  transition: transform 0.06s, box-shadow 0.06s, opacity 0.2s, background 0.15s;
  margin-bottom: 4px;
}

.tile.num {
  font-size: 26px;
  font-weight: 900;
}

.tile:active:not(:disabled) {
  transform: translateY(4px);
  box-shadow: none;
}

.tile.sel {
  border-color: var(--primary);
  background: var(--primary-soft);
  box-shadow: 0 4px 0 var(--primary-shadow);
  color: var(--primary-dark);
}

.tile.bad {
  border-color: var(--danger);
  background: var(--danger-soft);
  box-shadow: 0 4px 0 var(--danger-shadow);
  animation: shake 0.4s ease;
}

.tile.done {
  border-color: var(--success-fill);
  background: var(--success-soft);
  box-shadow: none;
  opacity: 0.5;
  transform: translateY(4px);
}

.score {
  text-align: center;
}

.score strong {
  color: var(--primary-dark);
}
</style>
