<script setup lang="ts">
import { Zap, Trophy, Flame, RotateCcw, Timer } from 'lucide-vue-next'

const props = defineProps<{
  title: string
  score: number
  scoreLabel: string
  max?: number
  best: number
  xpGain: number
  newBest: boolean
  streakUp: boolean
  streak: number
  timeMs?: number
  saved: boolean
}>()
const emit = defineEmits<{ retry: []; exit: [] }>()

const good = computed(() => (props.max ? props.score / props.max >= 0.6 : props.score >= 10))
const time = computed(() => {
  if (props.timeMs == null) return null
  const s = Math.round(props.timeMs / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
})
</script>

<template>
  <section class="result">
    <div class="hero pop-in" :class="{ good }"><Trophy :size="56" :stroke-width="2" /></div>
    <p class="game-name muted">{{ title }}</p>
    <h1 class="rise-in">{{ newBest ? 'Novo recorde!' : good ? 'Mandou bem!' : 'Boa tentativa!' }}</h1>

    <div class="score pop-in" style="animation-delay: 0.15s">
      <strong>{{ score }}</strong><span v-if="max">/{{ max }}</span>
      <small>{{ scoreLabel }}</small>
    </div>

    <div class="tiles">
      <div class="tile xp rise-in" style="animation-delay: 0.25s">
        <p class="h">XP</p>
        <p class="b"><Zap :size="18" fill="currentColor" /> +{{ xpGain }}</p>
      </div>
      <div class="tile best rise-in" style="animation-delay: 0.35s">
        <p class="h">Recorde</p>
        <p class="b"><Trophy :size="18" /> {{ best }}</p>
      </div>
      <div v-if="time" class="tile time rise-in" style="animation-delay: 0.45s">
        <p class="h">Tempo</p>
        <p class="b"><Timer :size="18" /> {{ time }}</p>
      </div>
    </div>

    <span v-if="streakUp" class="badge pop-in" style="animation-delay: 0.6s">
      <Flame :size="16" fill="currentColor" /> Ofensiva: {{ streak }} {{ streak === 1 ? 'dia' : 'dias' }}
    </span>
    <p v-if="!saved" class="warn">Não conseguimos salvar o resultado. Verifique a conexão.</p>

    <div class="actions">
      <button class="btn btn-block" @click="emit('retry')"><RotateCcw :size="18" :stroke-width="3" /> Jogar de novo</button>
      <button class="btn-plain" @click="emit('exit')">Voltar ao Ensaio</button>
    </div>
  </section>
</template>

<style scoped>
.result {
  flex: 1;
  width: 100%;
  max-width: 440px;
  margin: 0 auto;
  padding: 32px 16px calc(32px + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 10px;
}

.hero {
  width: 108px;
  height: 108px;
  display: grid;
  place-items: center;
  border-radius: var(--r-xl);
  background: var(--primary-fill);
  color: var(--on-primary);
  box-shadow: 0 6px 0 var(--primary-shadow);
  margin-bottom: 6px;
}

.hero.good {
  background: var(--gold-fill);
  color: var(--on-gold);
  box-shadow: 0 6px 0 var(--gold-shadow);
}

.game-name {
  font-size: 13px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

h1 {
  font-size: 28px;
}

.score {
  display: flex;
  align-items: baseline;
  gap: 4px;
  color: var(--primary-dark);
}

.score strong {
  font-size: 56px;
  font-weight: 900;
  line-height: 1;
}

.score span {
  font-size: 22px;
  font-weight: 900;
  color: var(--muted);
}

.score small {
  font-size: 15px;
  font-weight: 800;
  color: var(--muted);
  margin-left: 4px;
}

.tiles {
  width: 100%;
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 8px;
}

.tile {
  flex: 1;
  max-width: 130px;
  border: 2px solid var(--c);
  border-radius: var(--r-md);
  background: var(--c);
  overflow: hidden;
}

.tile.xp {
  --c: var(--gold-fill);
  --ink: var(--on-gold);
}

.tile.best {
  --c: var(--primary-fill);
  --ink: var(--on-primary);
}

.tile.time {
  --c: var(--success-fill);
  --ink: var(--on-success);
}

.tile .h {
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--ink);
  padding: 4px 0;
}

.tile .b {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 10px 4px;
  background: var(--surface);
  border-radius: calc(var(--r-md) - 4px);
  font-size: 19px;
  font-weight: 900;
  color: var(--ink);
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: var(--r-sm);
  background: var(--flame-soft);
  color: var(--flame-dark);
  font-weight: 900;
  font-size: 14px;
  margin-top: 6px;
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
  margin-top: 18px;
}
</style>
