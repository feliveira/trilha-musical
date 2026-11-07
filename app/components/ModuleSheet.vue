<script setup lang="ts">
import { BookOpen, Dumbbell, Lock, Clock, Check, X, Trophy } from 'lucide-vue-next'
import type { ModuleDef, ModuleProgress } from '#shared/types'
import type { NodeStatus } from '~/composables/useUser'
import { PASS_SCORE, QUESTIONS_PER_SESSION } from '~/data/modules'

const props = defineProps<{
  module: ModuleDef
  progress: ModuleProgress
  status: NodeStatus
  stars: number
}>()
const emit = defineEmits<{ close: [] }>()

const maxXp = QUESTIONS_PER_SESSION * 10 + 20
const playable = computed(() => props.status !== 'locked' && props.status !== 'soon')

onMounted(() => {
  const onKey = (e: KeyboardEvent) => e.key === 'Escape' && emit('close')
  window.addEventListener('keydown', onKey)
  onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
})
</script>

<template>
  <div class="backdrop" @click.self="emit('close')">
    <div class="sheet" role="dialog" :aria-label="`Módulo ${module.id}`">
      <button class="icon-btn close" aria-label="Fechar" @click="emit('close')"><X :size="22" /></button>

      <div class="head">
        <div class="badge" :class="status">
          <span>{{ module.id }}</span>
        </div>
        <div>
          <p class="eyebrow">Módulo {{ module.id }} de 16</p>
          <h2>{{ module.available ? module.title : 'Em breve' }}</h2>
          <p class="muted sub">{{ module.subtitle }}</p>
        </div>
      </div>

      <template v-if="playable">
        <div class="score-card">
          <div class="score-main">
            <Trophy :size="22" class="trophy" />
            <div>
              <p class="label">Maior nota</p>
              <p class="value">{{ progress.attempts ? `${progress.bestScore}%` : '—' }}</p>
            </div>
          </div>
          <div class="score-side">
            <StarRow :count="stars" :size="22" />
            <p class="label">{{ progress.attempts }} {{ progress.attempts === 1 ? 'tentativa' : 'tentativas' }}</p>
          </div>
        </div>

        <div class="actions">
          <NuxtLink :to="`/modulo/${module.id}/teoria`" class="option">
            <span class="opt-icon theory"><BookOpen :size="26" :stroke-width="2.4" /></span>
            <span class="opt-text">
              <strong>Ler teoria</strong>
              <small v-if="progress.theoryRead" class="done"><Check :size="14" :stroke-width="3" /> Lida</small>
              <small v-else>+15 XP na primeira leitura</small>
            </span>
          </NuxtLink>
          <NuxtLink :to="`/modulo/${module.id}/praticar`" class="option">
            <span class="opt-icon practice"><Dumbbell :size="26" :stroke-width="2.4" /></span>
            <span class="opt-text">
              <strong>Fazer exercícios</strong>
              <small>{{ QUESTIONS_PER_SESSION }} questões · até {{ maxXp }} XP</small>
            </span>
          </NuxtLink>
        </div>

        <p v-if="progress.bestScore < PASS_SCORE" class="hint muted">
          Faça {{ PASS_SCORE }}% ou mais nos exercícios para liberar o próximo módulo.
        </p>
      </template>

      <div v-else class="locked-msg">
        <component :is="status === 'soon' ? Clock : Lock" :size="28" />
        <p v-if="status === 'soon'">O conteúdo deste módulo está sendo preparado. Volte em breve!</p>
        <p v-else>Complete o módulo {{ module.id - 1 }} com pelo menos {{ PASS_SCORE }}% para desbloquear.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 60;
  background: var(--backdrop);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

@media (min-width: 640px) {
  .backdrop {
    align-items: center;
    padding: 16px;
  }
}

.sheet {
  position: relative;
  width: 100%;
  max-width: 480px;
  background: var(--surface);
  border-radius: var(--r-xl) var(--r-xl) 0 0;
  padding: 24px 20px calc(24px + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: 18px;
}

@media (min-width: 640px) {
  .sheet {
    border-radius: var(--r-xl);
    padding: 28px;
  }
}

.close {
  position: absolute;
  top: 12px;
  right: 12px;
}

.head {
  display: flex;
  gap: 16px;
  align-items: center;
  padding-right: 32px;
}

.badge {
  flex: none;
  width: 64px;
  height: 64px;
  display: grid;
  place-items: center;
  border-radius: var(--r-lg);
  font-size: 28px;
  font-weight: 900;
  color: var(--on-primary);
  background: var(--primary-fill);
  box-shadow: 0 4px 0 var(--primary-shadow);
}

.badge.done {
  background: var(--gold-fill);
  box-shadow: 0 4px 0 var(--gold-shadow);
  color: var(--on-gold);
}

.badge.locked,
.badge.soon {
  background: var(--locked);
  box-shadow: 0 4px 0 var(--locked-dark);
  color: var(--locked-text);
}

.eyebrow {
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
}

h2 {
  font-size: 22px;
}

.sub {
  font-size: 14px;
  margin-top: 2px;
}

.score-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 2px solid var(--border);
  border-radius: var(--r-md);
}

.score-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.trophy {
  color: var(--gold);
}

.score-side {
  text-align: right;
}

.label {
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted);
}

.value {
  font-size: 24px;
  font-weight: 900;
  line-height: 1.1;
}

.actions {
  display: grid;
  gap: 12px;
}

.option {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  border: 2px solid var(--border);
  border-radius: var(--r-md);
  box-shadow: 0 4px 0 var(--border);
  transition:
    transform 0.08s,
    box-shadow 0.08s,
    border-color 0.15s;
  margin-bottom: 4px;
}

.option:hover {
  border-color: var(--primary);
  box-shadow: 0 4px 0 color-mix(in srgb, var(--primary) 45%, var(--border));
}

.option:active {
  transform: translateY(4px);
  box-shadow: 0 0 0 var(--border);
}

.opt-icon {
  flex: none;
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: var(--r-sm);
}

.opt-icon.theory {
  background: var(--primary-soft);
  color: var(--primary);
}

.opt-icon.practice {
  background: var(--success-soft);
  color: var(--success);
}

.opt-text {
  display: flex;
  flex-direction: column;
}

.opt-text strong {
  font-size: 17px;
  font-weight: 900;
}

.opt-text small {
  font-size: 13px;
  color: var(--muted);
  font-weight: 700;
}

.opt-text small.done {
  color: var(--success);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.hint {
  font-size: 13px;
  text-align: center;
}

.locked-msg {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border-radius: var(--r-md);
  background: var(--surface-2);
  color: var(--muted);
  font-weight: 700;
}
</style>
