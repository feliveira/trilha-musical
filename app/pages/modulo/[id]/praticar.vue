<script setup lang="ts">
import { Check, X, Flame } from 'lucide-vue-next'
import type { ChoiceQuestion, FillQuestion, Question } from '#shared/types'
import { getModule, QUESTIONS_PER_SESSION } from '~/data/modules'
import type { LessonResultData } from '~/composables/useUser'

definePageMeta({ layout: 'focus' })

type Item =
  | { key: string; kind: 'choice'; q: ChoiceQuestion; order: number[] }
  | { key: string; kind: 'fill'; q: FillQuestion; bank: string[] }

const route = useRoute()
const mod = getModule(Number(route.params.id))
if (!mod || !mod.available) navigateTo('/')

const { submitLesson, streak } = useUser()
const { sfx } = useAudio()

// ---------- montagem da sessão ----------
function prepare(q: Question, suffix = ''): Item {
  if (q.type === 'choice') {
    return { key: q.id + suffix, kind: 'choice', q, order: shuffle(q.options.map((_, i) => i)) }
  }
  const words = Array.from(new Set([...q.answers, ...q.distractors]))
  return { key: q.id + suffix, kind: 'fill', q, bank: shuffle(words) }
}

/** Escolhe questões distribuídas entre as seções do módulo */
function pickQuestions(all: Question[], n: number): Question[] {
  const bySection = new Map<string, Question[]>()
  for (const q of shuffle(all)) {
    if (!bySection.has(q.section)) bySection.set(q.section, [])
    bySection.get(q.section)!.push(q)
  }
  const groups = [...bySection.keys()].sort().map((k) => bySection.get(k)!)
  const out: Question[] = []
  while (out.length < Math.min(n, all.length)) {
    for (const g of groups) {
      const q = g.shift()
      if (q && out.length < n) out.push(q)
    }
  }
  // mantém uma progressão aproximada pela ordem das seções, com leve mistura
  return out.sort((a, b) => a.section.localeCompare(b.section) + (Math.random() - 0.5) * 1.2)
}

const queue = ref<Item[]>([])
const pos = ref(0)
const total = ref(0)
const firstTry = ref<Record<string, boolean>>({})
const solved = ref(0)
const combo = ref(0)
const bestCombo = ref(0)
const phase = ref<'answer' | 'feedback' | 'saving' | 'done'>('answer')
const lastCorrect = ref(false)
const feedbackTitle = ref('')
const startedAt = ref(Date.now())
const elapsed = ref(0)
const result = ref<(LessonResultData & { saved: boolean }) | null>(null)
const comboToast = ref<number | null>(null)
const confirmExit = ref(false)

// respostas
const selected = ref<number | null>(null)
const slots = ref<(number | null)[]>([])

function start() {
  if (!mod) return
  const qs = pickQuestions(mod.questions, QUESTIONS_PER_SESSION)
  queue.value = qs.map((q) => prepare(q))
  total.value = qs.length
  pos.value = 0
  firstTry.value = {}
  solved.value = 0
  combo.value = 0
  bestCombo.value = 0
  result.value = null
  startedAt.value = Date.now()
  phase.value = 'answer'
  resetAnswer()
}

const current = computed(() => queue.value[pos.value])
const isRetry = computed(() => !!current.value && current.value.key.includes('#'))

function resetAnswer() {
  selected.value = null
  const it = queue.value[pos.value]
  slots.value = it?.kind === 'fill' ? it.q.answers.map(() => null) : []
}

const canCheck = computed(() => {
  const it = current.value
  if (!it) return false
  return it.kind === 'choice' ? selected.value !== null : slots.value.every((s) => s !== null)
})

const norm = (s: string) => s.trim().toLowerCase()

function evaluate(it: Item) {
  if (it.kind === 'choice') return it.order[selected.value!] === it.q.answer
  return slots.value.every((b, i) => b !== null && norm(it.bank[b]!) === norm(it.q.answers[i]!))
}

const correctAnswerText = computed(() => {
  const it = current.value
  if (!it) return ''
  if (it.kind === 'choice') return it.q.options[it.q.answer]!
  let i = 0
  return it.q.text.replace(/___/g, () => it.q.answers[i++] ?? '')
})

const PRAISE = ['Muito bem!', 'Excelente!', 'Isso aí!', 'Mandou bem!', 'Perfeito!', 'Afinadíssimo!']
const OOPS = ['Quase lá!', 'Não foi dessa vez', 'Vamos revisar']

function check() {
  const it = current.value
  if (!it || !canCheck.value || phase.value !== 'answer') return
  const ok = evaluate(it)
  lastCorrect.value = ok
  const baseId = it.q.id
  if (!(baseId in firstTry.value)) firstTry.value[baseId] = ok

  if (ok) {
    solved.value++
    combo.value++
    bestCombo.value = Math.max(bestCombo.value, combo.value)
    feedbackTitle.value = PRAISE[Math.floor(Math.random() * PRAISE.length)]!
    if ([3, 5, 8, 10, 12].includes(combo.value)) {
      comboToast.value = combo.value
      setTimeout(() => sfx.combo(), 250)
      setTimeout(() => (comboToast.value = null), 1600)
    }
    sfx.correct()
  } else {
    combo.value = 0
    feedbackTitle.value = OOPS[Math.floor(Math.random() * OOPS.length)]!
    // volta para o fim da fila
    queue.value.push(prepare(it.q, `#${pos.value}`))
    sfx.wrong()
  }
  phase.value = 'feedback'
}

async function next() {
  if (phase.value !== 'feedback') return
  if (pos.value + 1 < queue.value.length) {
    pos.value++
    resetAnswer()
    phase.value = 'answer'
    return
  }
  await finish()
}

async function finish() {
  if (!mod) return
  elapsed.value = Date.now() - startedAt.value
  phase.value = 'saving'
  const correct = Object.values(firstTry.value).filter(Boolean).length
  try {
    const res = await submitLesson(mod.id, correct, total.value)
    result.value = { ...res, saved: true }
  } catch (e) {
    console.error(e)
    const score = Math.round((correct / total.value) * 100)
    result.value = { score, xpGain: 0, perfect: false, prevBest: 0, newBest: false, streakUp: false, saved: false }
  }
  phase.value = 'done'
  sfx.complete()
}

const progress = computed(() => (total.value ? solved.value / total.value : 0))
const firstTryCorrect = computed(() => Object.values(firstTry.value).filter(Boolean).length)

// ---------- teclado ----------
function onKey(e: KeyboardEvent) {
  if (confirmExit.value) return
  if (e.key === 'Enter') {
    e.preventDefault()
    if (phase.value === 'answer') check()
    else if (phase.value === 'feedback') next()
    return
  }
  const it = current.value
  if (phase.value === 'answer' && it?.kind === 'choice') {
    const n = Number(e.key)
    if (n >= 1 && n <= it.order.length) {
      selected.value = n - 1
      sfx.tap()
    }
  }
}

onMounted(() => {
  start()
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

function askExit() {
  if (phase.value === 'done' || solved.value === 0) navigateTo('/')
  else confirmExit.value = true
}

function selectOption(i: number) {
  selected.value = i
  sfx.tap()
}
</script>

<template>
  <template v-if="mod">
    <!-- Resultado -->
    <LessonResult
      v-if="phase === 'done' && result"
      :score="result.score"
      :correct="firstTryCorrect"
      :total="total"
      :xp-gain="result.xpGain"
      :time-ms="elapsed"
      :best-combo="bestCombo"
      :new-best="result.newBest"
      :prev-best="result.prevBest"
      :streak-up="result.streakUp"
      :streak="streak"
      :saved="result.saved"
      @retry="start"
      @continue="navigateTo('/')"
    />

    <!-- Lição -->
    <template v-else-if="current">
      <FocusTopBar :progress="progress" @close="askExit">
        <div class="combo" :class="{ on: combo >= 2 }" :title="`${combo} seguidas`">
          <Flame :size="20" :fill="combo >= 2 ? 'currentColor' : 'none'" :stroke-width="2.5" />
          <span>{{ combo }}</span>
        </div>
      </FocusTopBar>

      <Transition name="fade">
        <div v-if="comboToast" class="combo-toast pop-in">
          <Flame :size="22" fill="currentColor" /> {{ comboToast }} seguidas!
        </div>
      </Transition>

      <main class="stage">
        <div :key="current.key" class="question rise-in">
          <p v-if="isRetry" class="retry-tag">Revisão</p>
          <h1 class="prompt">
            {{ current.kind === 'choice' ? current.q.prompt : current.q.prompt ?? 'Complete a frase' }}
          </h1>

          <LessonChoiceExercise
            v-if="current.kind === 'choice'"
            :q="current.q"
            :order="current.order"
            :selected="selected"
            :locked="phase !== 'answer'"
            @select="selectOption"
          />
          <LessonFillExercise
            v-else
            v-model:slots="slots"
            :q="current.q"
            :bank="current.bank"
            :locked="phase !== 'answer'"
          />
        </div>
      </main>

      <footer class="footer" :class="phase === 'feedback' ? (lastCorrect ? 'ok' : 'bad') : ''">
        <div class="footer-inner">
          <div v-if="phase === 'feedback'" class="fb rise-in">
            <span class="fb-icon round"><component :is="lastCorrect ? Check : X" :size="30" :stroke-width="3.5" /></span>
            <div class="fb-text">
              <p class="fb-title">{{ feedbackTitle }}</p>
              <p v-if="!lastCorrect" class="fb-answer"><strong>Resposta correta:</strong> {{ correctAnswerText }}</p>
              <p v-if="current.q.explain" class="fb-explain">{{ current.q.explain }}</p>
            </div>
          </div>

          <button
            v-if="phase === 'answer'"
            class="btn btn-success main-btn"
            :disabled="!canCheck"
            @click="check"
          >
            Verificar
          </button>
          <button
            v-else
            class="btn main-btn"
            :class="lastCorrect ? 'btn-success' : 'btn-danger'"
            :disabled="phase === 'saving'"
            @click="next"
          >
            {{ phase === 'saving' ? 'Salvando…' : 'Continuar' }}
          </button>
        </div>
      </footer>
    </template>

    <Transition name="fade">
      <ConfirmDialog
        v-if="confirmExit"
        title="Quer mesmo sair?"
        text="Seu progresso nesta lição será perdido."
        confirm-label="Sair da lição"
        cancel-label="Continuar praticando"
        @confirm="navigateTo('/')"
        @cancel="confirmExit = false"
      />
    </Transition>
  </template>
</template>

<style scoped>
.combo {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 900;
  font-size: 17px;
  color: var(--faint);
  min-width: 44px;
}

.combo.on {
  color: var(--flame-dark);
}

.combo-toast {
  position: fixed;
  top: 72px;
  left: 50%;
  translate: -50% 0;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: var(--r-md);
  background: var(--flame-fill);
  color: var(--on-flame);
  font-weight: 900;
  font-size: 17px;
  box-shadow: 0 4px 0 var(--flame-shadow);
}

.stage {
  flex: 1;
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  padding: 24px 16px 220px;
}

@media (min-width: 900px) {
  .stage {
    padding-top: 48px;
  }
}

.question {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.retry-tag {
  align-self: flex-start;
  margin-bottom: -12px;
  padding: 4px 10px;
  border-radius: var(--r-xs);
  background: var(--flame-soft);
  color: var(--flame-dark);
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.prompt {
  font-size: 24px;
  line-height: 1.3;
}

@media (min-width: 640px) {
  .prompt {
    font-size: 28px;
  }
}

/* Rodapé / feedback */
.footer {
  position: fixed;
  inset: auto 0 0 0;
  z-index: 20;
  background: var(--surface);
  border-top: 2px solid var(--border);
  padding: 16px 16px calc(16px + env(safe-area-inset-bottom));
  transition: background 0.2s;
}

.footer.ok {
  background: var(--success-soft);
  border-top-color: transparent;
}

.footer.bad {
  background: var(--danger-soft);
  border-top-color: transparent;
}

.footer-inner {
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

@media (min-width: 720px) {
  .footer-inner {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    min-height: 72px;
  }
}

.main-btn {
  width: 100%;
}

@media (min-width: 720px) {
  .main-btn {
    width: auto;
    min-width: 180px;
    margin-left: auto;
  }
}

.fb {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.fb-icon {
  flex: none;
  width: 52px;
  height: 52px;
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

.fb-title {
  font-size: 22px;
  font-weight: 900;
}

.ok .fb-title {
  color: var(--success-dark);
}

.bad .fb-title {
  color: var(--danger-dark);
}


.fb-answer {
  color: var(--danger-dark);
  font-size: 15px;
}


.fb-explain {
  font-size: 14px;
  color: var(--text);
  opacity: 0.8;
  margin-top: 2px;
}
</style>
