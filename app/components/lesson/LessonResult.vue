<script setup lang="ts">
import { Zap, Target, Timer, Flame, Trophy, RotateCcw } from 'lucide-vue-next'
import { PASS_SCORE } from '~/data/modules'

const props = defineProps<{
  score: number
  correct: number
  total: number
  xpGain: number
  timeMs: number
  bestCombo: number
  newBest: boolean
  prevBest: number
  streakUp: boolean
  streak: number
  saved: boolean
}>()
const emit = defineEmits<{ retry: []; continue: [] }>()

const stars = computed(() => starsFor(props.score))
const passed = computed(() => props.score >= PASS_SCORE)

const title = computed(() => {
  if (props.score === 100) return 'Perfeito!'
  if (props.score >= 80) return 'Excelente!'
  if (passed.value) return 'Lição concluída!'
  return 'Continue praticando!'
})

const subtitle = computed(() => {
  if (props.score === 100) return 'Você acertou tudo de primeira. Que ouvido afinado!'
  if (passed.value) return 'Você está dominando o conteúdo.'
  return `Tire ${PASS_SCORE}% ou mais para liberar o próximo módulo. Você consegue!`
})

const time = computed(() => {
  const s = Math.round(props.timeMs / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
})

// Confete: peças sólidas, sem degradê
const CONFETTI_COLORS = ['var(--fam-2)', 'var(--fam-5)', 'var(--fam-7)', 'var(--gold-fill)', 'var(--success-fill)', 'var(--border-strong)']
const confetti = Array.from({ length: 36 }, (_, i) => ({
  left: Math.random() * 100,
  delay: Math.random() * 0.6,
  dur: 1.8 + Math.random() * 1.4,
  rot: Math.random() * 360,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  w: 6 + Math.random() * 6,
}))
</script>

<template>
  <section class="result">
    <div v-if="passed" class="confetti" aria-hidden="true">
      <i
        v-for="(c, i) in confetti"
        :key="i"
        :style="{
          left: `${c.left}%`,
          animationDelay: `${c.delay}s`,
          animationDuration: `${c.dur}s`,
          background: c.color,
          width: `${c.w}px`,
          height: `${c.w * 1.6}px`,
          rotate: `${c.rot}deg`,
        }"
      />
    </div>

    <div class="hero pop-in" :class="{ fail: !passed }">
      <Trophy :size="60" :stroke-width="2" />
    </div>
    <StarRow :count="stars" :size="40" animate />

    <h1 class="rise-in">{{ title }}</h1>
    <p class="muted sub rise-in">{{ subtitle }}</p>

    <div class="badges">
      <span v-if="newBest && prevBest > 0" class="badge best pop-in" style="animation-delay: 0.9s">
        <Trophy :size="16" /> Novo recorde! {{ prevBest }}% → {{ score }}%
      </span>
      <span v-if="streakUp" class="badge streak pop-in" style="animation-delay: 1.1s">
        <Flame :size="16" fill="currentColor" /> Ofensiva: {{ streak }} {{ streak === 1 ? 'dia' : 'dias' }}
      </span>
    </div>

    <div class="tiles">
      <div class="tile xp rise-in" style="animation-delay: 0.3s">
        <p class="tile-head">Total de XP</p>
        <p class="tile-body"><Zap :size="20" fill="currentColor" /> {{ xpGain }}</p>
      </div>
      <div class="tile acc rise-in" style="animation-delay: 0.4s">
        <p class="tile-head">Nota</p>
        <p class="tile-body"><Target :size="20" /> {{ score }}%</p>
      </div>
      <div class="tile time rise-in" style="animation-delay: 0.5s">
        <p class="tile-head">Tempo</p>
        <p class="tile-body"><Timer :size="20" /> {{ time }}</p>
      </div>
    </div>

    <p class="muted detail">
      {{ correct }} de {{ total }} certas de primeira<span v-if="bestCombo >= 3"> · melhor sequência: {{ bestCombo }}</span>
    </p>
    <p v-if="!saved" class="warn">Não conseguimos salvar seu resultado. Verifique a conexão.</p>

    <div class="actions">
      <button class="btn btn-block" :class="passed ? 'btn-success' : ''" @click="emit('continue')">Continuar</button>
      <button class="btn-plain" @click="emit('retry')"><RotateCcw :size="16" :stroke-width="3" /> Praticar de novo</button>
    </div>
  </section>
</template>

<style scoped>
.result {
  position: relative;
  flex: 1;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  padding: 32px 16px calc(32px + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 12px;
}

.confetti {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.confetti i {
  position: absolute;
  top: -20px;
  border-radius: 2px;
  animation: fall linear both;
}

@keyframes fall {
  to {
    transform: translateY(110vh) rotate(540deg);
    opacity: 0.6;
  }
}

.hero {
  width: 120px;
  height: 120px;
  display: grid;
  place-items: center;
  border-radius: var(--r-xl);
  background: var(--gold-fill);
  color: var(--on-gold);
  box-shadow: 0 6px 0 var(--gold-shadow);
  margin-bottom: 6px;
}

.hero.fail {
  background: var(--primary-fill);
  color: var(--on-primary);
  box-shadow: 0 6px 0 var(--primary-shadow);
}

h1 {
  font-size: 30px;
  color: var(--gold-dark);
  margin-top: 6px;
}

.hero.fail ~ h1 {
  color: var(--primary);
}

.sub {
  max-width: 340px;
}

.badges {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: var(--r-sm);
  font-weight: 900;
  font-size: 14px;
}

.badge.best {
  background: var(--gold-soft);
  color: var(--gold-dark);
}

.badge.streak {
  background: var(--flame-soft);
  color: var(--flame-dark);
}

.tiles {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 12px;
}

.tile {
  border: 2px solid var(--c);
  border-radius: var(--r-md);
  overflow: hidden;
  background: var(--c);
}

.tile.xp {
  --c: var(--gold-fill);
  --ink: var(--on-gold);
}

.tile.acc {
  --c: var(--success-fill);
  --ink: var(--on-success);
}

.tile.time {
  --c: var(--primary-fill);
  --ink: var(--on-primary);
}

.tile-head {
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--ink);
  padding: 4px 0;
}

.tile-body {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 4px;
  background: var(--surface);
  border-radius: calc(var(--r-md) - 4px);
  font-size: 20px;
  font-weight: 900;
  color: var(--ink);
}

.detail {
  font-size: 14px;
}

.warn {
  color: var(--danger);
  font-weight: 800;
  font-size: 14px;
}

.actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  margin-top: 20px;
  position: relative;
  z-index: 1;
}

.actions .btn-plain {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
</style>
