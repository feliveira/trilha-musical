<script setup lang="ts">
import { X, Check, Plus } from 'lucide-vue-next'
import type { FigureValue } from '#shared/types'
import { SOMA_ROUNDS } from '#shared/utils/games'
import { gameMeta } from '~/data/games'
import type { SomaRound } from '~/utils/gameGen'

definePageMeta({ layout: 'focus' })

const route = useRoute()
const meta = gameMeta('soma')
const mode = computed(() => (route.query.modo === 'silencio' ? 'silencio' : 'som'))
const kind = computed(() => (mode.value === 'silencio' ? 'rest' : 'note'))
const modeLabel = computed(() => meta.modes.find((m) => m.id === mode.value)!.label)

const { sfx } = useAudio()
const { streak } = useUser()
const { outcome, finish, reset } = useGameSubmit('soma', mode)

const phase = ref<'playing' | 'saving' | 'done'>('playing')
const round = ref(0)
const current = ref<SomaRound>(genSomaRound())
const picked = ref<FigureValue | null>(null)
const score = ref(0)
const combo = ref(0)
const startedAt = ref(Date.now())
const elapsed = ref(0)

const answered = computed(() => picked.value !== null)
const correct = computed(() => picked.value === current.value.answer)

function start() {
  reset()
  round.value = 0
  score.value = 0
  combo.value = 0
  picked.value = null
  current.value = genSomaRound()
  startedAt.value = Date.now()
  phase.value = 'playing'
}

function choose(v: FigureValue) {
  if (answered.value) return
  picked.value = v
  if (v === current.value.answer) {
    score.value++
    combo.value++
    sfx.correct()
    if (combo.value >= 3) setTimeout(() => sfx.combo(), 200)
  } else {
    combo.value = 0
    sfx.wrong()
  }
}

async function next() {
  if (!answered.value) return
  if (round.value + 1 >= SOMA_ROUNDS) {
    elapsed.value = Date.now() - startedAt.value
    phase.value = 'saving'
    sfx.complete()
    await finish(score.value)
    phase.value = 'done'
    return
  }
  round.value++
  picked.value = null
  current.value = genSomaRound(current.value)
}

function onKey(e: KeyboardEvent) {
  if (phase.value !== 'playing') return
  if (e.key === 'Enter') return next()
  const n = Number(e.key)
  if (n >= 1 && n <= current.value.options.length && !answered.value) choose(current.value.options[n - 1]!)
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

const nameOf = (v: FigureValue) => (kind.value === 'note' ? figureInfo(v).name : figureInfo(v).restName)
</script>

<template>
  <GameResult
    v-if="phase === 'done' && outcome"
    :title="`${meta.title} · ${modeLabel}`"
    :score="outcome.score"
    :max="SOMA_ROUNDS"
    score-label="acertos"
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
    <FocusTopBar :progress="(round + (answered ? 1 : 0)) / SOMA_ROUNDS" @close="navigateTo('/ensaio')">
      <span class="count">{{ round + 1 }}/{{ SOMA_ROUNDS }}</span>
    </FocusTopBar>

    <main class="stage">
      <p class="eyebrow">{{ modeLabel }}</p>
      <h1>Qual figura única vale o mesmo que estas juntas?</h1>

      <div :key="round" class="sum rise-in">
        <template v-for="(v, i) in current.parts" :key="i">
          <span v-if="i > 0" class="plus"><Plus :size="18" :stroke-width="3" /></span>
          <MusicFigureIcon :kind="kind" :value="v" :size="60" />
        </template>
        <span class="eq">=</span>
        <span class="qmark" :class="{ ok: answered && correct, bad: answered && !correct }">
          <MusicFigureIcon v-if="answered" :kind="kind" :value="current.answer" :size="60" />
          <template v-else>?</template>
        </span>
      </div>

      <div class="options">
        <button
          v-for="(v, i) in current.options"
          :key="`${round}-${v}`"
          class="opt"
          :class="{
            ok: answered && v === current.answer,
            bad: answered && v === picked && !correct,
            dim: answered && v !== current.answer && v !== picked,
          }"
          :disabled="answered"
          :aria-label="nameOf(v)"
          @click="choose(v)"
        >
          <span class="k">{{ i + 1 }}</span>
          <MusicFigureIcon :kind="kind" :value="v" :size="58" />
          <small v-if="answered">{{ nameOf(v) }}</small>
        </button>
      </div>
    </main>

    <footer class="footer" :class="answered ? (correct ? 'ok' : 'bad') : ''">
      <div class="inner">
        <p v-if="answered" class="fb rise-in">
          <span class="fb-icon round"><component :is="correct ? Check : X" :size="26" :stroke-width="3.5" /></span>
          <span>
            <strong>{{ correct ? 'Isso aí!' : 'Quase!' }}</strong>
            <small>
              {{ current.parts.length }} figuras juntas = 1 {{ nameOf(current.answer) }}
            </small>
          </span>
        </p>
        <p v-else class="muted hint">Escolha a figura que equivale à soma.</p>
        <button class="btn main" :class="answered ? (correct ? 'btn-success' : 'btn-danger') : ''" :disabled="!answered || phase === 'saving'" @click="next">
          {{ phase === 'saving' ? 'Salvando…' : 'Continuar' }}
        </button>
      </div>
    </footer>
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
  max-width: 600px;
  margin: 0 auto;
  padding: 20px 16px 180px;
  display: flex;
  flex-direction: column;
  gap: 18px;
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
  margin-top: -10px;
}

.sum {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 4px 6px;
  padding: 20px 12px;
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: var(--r-lg);
  min-height: 120px;
}

.plus,
.eq {
  color: var(--faint);
  font-weight: 900;
  font-size: 24px;
  display: inline-flex;
}

.qmark {
  min-width: 60px;
  height: 76px;
  display: grid;
  place-items: center;
  border: 2px dashed var(--border-strong);
  border-radius: var(--r-md);
  font-size: 30px;
  font-weight: 900;
  color: var(--faint);
}

.qmark.ok {
  border: 2px solid var(--success);
  background: var(--success-soft);
}

.qmark.bad {
  border: 2px solid var(--danger);
  background: var(--danger-soft);
}

.options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.opt {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-height: 104px;
  padding: 10px 4px;
  border: 2px solid var(--border);
  background: var(--surface);
  border-radius: var(--r-md);
  box-shadow: 0 4px 0 var(--border);
  transition: transform 0.06s, box-shadow 0.06s;
  margin-bottom: 4px;
}

.opt:active:not(:disabled) {
  transform: translateY(4px);
  box-shadow: none;
}

.opt small {
  font-size: 11px;
  font-weight: 800;
  line-height: 1.1;
}

.k {
  position: absolute;
  top: 4px;
  left: 7px;
  font-size: 10px;
  font-weight: 900;
  color: var(--faint);
}

.opt.ok {
  border-color: var(--success);
  background: var(--success-soft);
  box-shadow: 0 4px 0 var(--success-shadow);
  color: var(--success-dark);
}

.opt.bad {
  border-color: var(--danger);
  background: var(--danger-soft);
  box-shadow: 0 4px 0 var(--danger-shadow);
  color: var(--danger-dark);
  animation: shake 0.4s ease;
}

.opt.dim {
  opacity: 0.45;
}

.footer {
  position: fixed;
  inset: auto 0 0 0;
  background: var(--surface);
  border-top: 2px solid var(--border);
  padding: 14px 16px calc(14px + env(safe-area-inset-bottom));
}

.footer.ok {
  background: var(--success-soft);
  border-top-color: transparent;
}

.footer.bad {
  background: var(--danger-soft);
  border-top-color: transparent;
}

.inner {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.fb {
  display: flex;
  align-items: center;
  gap: 10px;
}

.fb > span:last-child {
  display: flex;
  flex-direction: column;
}

.fb strong {
  font-size: 19px;
}

.ok .fb strong {
  color: var(--success-dark);
}

.bad .fb strong {
  color: var(--danger-dark);
}

.fb small {
  font-size: 13px;
  color: var(--muted);
}

.fb-icon {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--surface);
}

.ok .fb-icon {
  color: var(--success);
}

.bad .fb-icon {
  color: var(--danger);
}

.hint {
  font-size: 14px;
}

.main {
  min-width: 160px;
  margin-left: auto;
}

@media (max-width: 520px) {
  .main {
    width: 100%;
  }
}
</style>
