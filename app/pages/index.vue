<script setup lang="ts">
import { Lock, Check, Flame, Zap, Trophy, ChevronRight, Clock } from 'lucide-vue-next'
import { PASS_SCORE, TOTAL_MODULES } from '~/data/modules'

const { user, trail, currentNode, streak, activeToday } = useUser()
const { sfx } = useAudio()

type TrailNode = (typeof trail.value)[number]
const selected = ref<TrailNode | null>(null)

// Zigue-zague estilo trilha
const OFFSETS = [0, 52, 84, 52, 0, -52, -84, -52]
const DECOR = [
  { at: 1, glyph: '\u{1D11E}', side: -1 },
  { at: 5, glyph: '♫', side: 1 },
  { at: 9, glyph: '\u{1D122}', side: -1 },
  { at: 13, glyph: '♪', side: 1 },
]

const doneCount = computed(() => trail.value.filter((n) => n.status === 'done').length)

function open(node: TrailNode) {
  sfx.tap()
  selected.value = node
}

onMounted(() => {
  nextTick(() => {
    const el = document.querySelector('.node.current')
    if (el && el.getBoundingClientRect().top > window.innerHeight * 0.7) {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
  })
})
</script>

<template>
  <div class="page">
    <div class="col">
      <!-- Banner do módulo atual -->
      <section class="banner">
        <div>
          <p class="eyebrow">Módulo {{ currentNode.module.id }}</p>
          <h1>{{ currentNode.module.title }}</h1>
        </div>
        <button class="btn banner-btn" @click="open(currentNode)">
          {{ currentNode.progress.attempts ? 'Continuar' : 'Começar' }}
        </button>
      </section>

      <!-- Lembrete de ofensiva (mobile) -->
      <NuxtLink v-if="!activeToday" :to="`/modulo/${currentNode.module.id}/praticar`" class="nudge">
        <span class="nudge-icon"><Flame :size="24" :stroke-width="2.5" /></span>
        <span>
          <strong>{{ streak > 0 ? `Mantenha sua ofensiva de ${streak} ${streak === 1 ? 'dia' : 'dias'}!` : 'Comece sua ofensiva hoje!' }}</strong>
          <small>Faça uma lição para marcar o dia.</small>
        </span>
        <ChevronRight :size="22" class="muted" />
      </NuxtLink>

      <!-- Trilha -->
      <div class="path">
        <div
          v-for="(node, i) in trail"
          :key="node.module.id"
          class="row"
          :style="{ '--x': `${OFFSETS[i % OFFSETS.length]}px`, '--d': `${i * 0.04}s` }"
        >
          <span
            v-for="d in DECOR.filter((d) => d.at === i)"
            :key="d.glyph"
            class="decor music"
            :style="{ '--side': d.side }"
          >{{ d.glyph }}</span>

          <div v-if="node.status === 'current'" class="bubble">
            {{ node.progress.attempts ? 'Continuar' : 'Começar' }}
          </div>

          <button
            class="node"
            :class="node.status"
            :aria-label="`Módulo ${node.module.id}${node.status === 'locked' ? ' (bloqueado)' : node.status === 'soon' ? ' (em breve)' : ''}`"
            @click="open(node)"
          >
            <span class="num">{{ node.module.id }}</span>
            <span v-if="node.status === 'locked'" class="corner round"><Lock :size="13" :stroke-width="3" /></span>
            <span v-else-if="node.status === 'soon'" class="corner round"><Clock :size="13" :stroke-width="3" /></span>
            <span v-else-if="node.status === 'done'" class="corner round ok"><Check :size="14" :stroke-width="3.5" /></span>
          </button>

          <StarRow v-if="node.module.available && node.progress.attempts" :count="node.stars" :size="16" class="row-stars" />
          <span v-else-if="node.status === 'soon'" class="soon-label">Em breve</span>
        </div>
      </div>
    </div>

    <!-- Barra lateral (desktop) -->
    <aside class="side">
      <div class="card side-card">
        <div class="side-icon flame" :class="{ on: activeToday }"><Flame :size="30" :fill="activeToday ? 'currentColor' : 'none'" :stroke-width="2.4" /></div>
        <div>
          <p class="side-value">{{ streak }} {{ streak === 1 ? 'dia' : 'dias' }}</p>
          <p class="muted side-label">{{ activeToday ? 'Ofensiva garantida hoje!' : 'Pratique hoje para manter a ofensiva' }}</p>
        </div>
      </div>
      <div class="card side-card">
        <div class="side-icon xp"><Zap :size="30" fill="currentColor" /></div>
        <div>
          <p class="side-value">{{ user?.xp ?? 0 }} XP</p>
          <p class="muted side-label">{{ doneCount }} de {{ TOTAL_MODULES }} módulos concluídos</p>
        </div>
      </div>
      <NuxtLink to="/ranking" class="card side-card link">
        <div class="side-icon trophy"><Trophy :size="30" /></div>
        <div>
          <p class="side-value">Ranking</p>
          <p class="muted side-label">Veja quem está liderando</p>
        </div>
        <ChevronRight :size="22" class="muted push" />
      </NuxtLink>
      <p class="muted side-foot">Tire {{ PASS_SCORE }}% ou mais nos exercícios para liberar o próximo módulo.</p>
    </aside>

    <Transition name="fade">
      <ModuleSheet
        v-if="selected"
        :module="selected.module"
        :progress="selected.progress"
        :status="selected.status"
        :stars="selected.stars"
        @close="selected = null"
      />
    </Transition>
  </div>
</template>

<style scoped>
.page {
  max-width: 1040px;
  margin: 0 auto;
  display: flex;
  gap: 40px;
  justify-content: center;
}

.col {
  flex: 1;
  max-width: 560px;
  min-width: 0;
}

/* Banner */
.banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 18px 18px 20px;
  border-radius: var(--r-lg);
  background: var(--primary-fill);
  color: var(--on-primary);
  box-shadow: 0 5px 0 var(--primary-shadow);
  margin-bottom: 20px;
}

.banner .eyebrow {
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.8;
}

.banner h1 {
  font-size: 20px;
  margin-top: 2px;
}

.banner-btn {
  --c: #ffffff;
  --c-dark: var(--primary-shadow);
  --c-text: var(--primary-dark);
  flex: none;
  min-height: 46px;
  padding: 10px 18px;
  font-size: 14px;
}

/* Nudge */
.nudge {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border: 2px solid var(--border);
  border-radius: var(--r-lg);
  background: var(--surface);
  margin-bottom: 8px;
}

@media (min-width: 1024px) {
  .nudge {
    display: none;
  }
}

.nudge-icon {
  flex: none;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: var(--r-sm);
  background: var(--flame-soft);
  color: var(--flame);
}

.nudge span:nth-child(2) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.nudge small {
  color: var(--muted);
  font-size: 13px;
}

/* Trilha */
.path {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 56px 0 24px;
  gap: 22px;
}

.row {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  translate: var(--x) 0;
  animation: rise-in 0.4s ease both;
  animation-delay: var(--d);
}

.decor {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(calc(-50% + var(--side) * 150px), -50%) rotate(calc(var(--side) * 10deg));
  font-size: 92px;
  line-height: 1;
  color: var(--border);
  pointer-events: none;
  z-index: -1;
}

.node {
  --c: var(--primary-fill);
  --c-dark: var(--primary-shadow);
  position: relative;
  width: 76px;
  height: 72px;
  border: 0;
  border-radius: var(--r-lg);
  background: var(--c);
  color: var(--on-primary);
  box-shadow: 0 7px 0 var(--c-dark);
  transition:
    transform 0.08s,
    box-shadow 0.08s;
  margin-bottom: 7px;
}

.node:active {
  transform: translateY(6px);
  box-shadow: 0 1px 0 var(--c-dark);
}

.node .num {
  font-size: 30px;
  font-weight: 900;
  line-height: 1;
}

.node.done {
  --c: var(--gold-fill);
  --c-dark: var(--gold-shadow);
  color: var(--on-gold);
}

.node.locked,
.node.soon {
  --c: var(--locked);
  --c-dark: var(--locked-dark);
  color: var(--locked-text);
}

.node.current {
  outline: 4px solid color-mix(in srgb, var(--primary) 28%, transparent);
  outline-offset: 7px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    outline-color: color-mix(in srgb, var(--primary) 30%, transparent);
  }
  50% {
    outline-color: color-mix(in srgb, var(--primary) 8%, transparent);
  }
}

.corner {
  position: absolute;
  right: -6px;
  top: -6px;
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--surface);
  color: var(--locked-text);
  border: 2px solid var(--locked-dark);
}

.corner.ok {
  background: var(--success);
  border-color: var(--surface);
  color: #fff;
}

.bubble {
  position: absolute;
  bottom: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 14px;
  border-radius: var(--r-sm);
  background: var(--surface);
  border: 2px solid var(--border);
  color: var(--primary);
  font-weight: 900;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  animation: bob 1.6s ease-in-out infinite;
}

.bubble::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 100%;
  width: 12px;
  height: 12px;
  background: var(--surface);
  border-right: 2px solid var(--border);
  border-bottom: 2px solid var(--border);
  transform: translate(-50%, -5px) rotate(45deg);
  border-radius: 0 0 3px 0;
}

.row-stars {
  margin-top: -2px;
}

.soon-label {
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--faint);
}

/* Lateral */
.side {
  display: none;
  width: 320px;
  flex: none;
  flex-direction: column;
  gap: 14px;
  position: sticky;
  top: calc(var(--header-h) + 16px);
  align-self: flex-start;
}

@media (min-width: 1024px) {
  .side {
    display: flex;
  }
}

.side-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
}

.side-card.link:hover {
  border-color: var(--primary);
}

.side-icon {
  flex: none;
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: var(--r-sm);
}

.side-icon.flame {
  background: var(--surface-2);
  color: var(--faint);
}

.side-icon.flame.on {
  background: var(--flame-soft);
  color: var(--flame);
}

.side-icon.xp {
  background: var(--gold-soft);
  color: var(--gold);
}

.side-icon.trophy {
  background: var(--primary-soft);
  color: var(--primary);
}

.side-value {
  font-size: 19px;
  font-weight: 900;
}

.side-label {
  font-size: 13px;
}

.push {
  margin-left: auto;
}

.side-foot {
  font-size: 13px;
  padding: 0 8px;
}
</style>
