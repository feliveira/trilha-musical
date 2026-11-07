<script setup lang="ts">
import { ArrowLeft, ArrowRight, BookOpenCheck, Zap } from 'lucide-vue-next'
import { getModule } from '~/data/modules'

definePageMeta({ layout: 'focus' })

const route = useRoute()
const mod = getModule(Number(route.params.id))
if (!mod || !mod.available) {
  navigateTo('/')
}

const { markTheoryRead, progressOf } = useUser()
const { sfx } = useAudio()

const sections = mod?.theory ?? []
const idx = ref(0)
const section = computed(() => sections[idx.value]!)
const finished = ref(false)
const xpGain = ref(0)
const saving = ref(false)
const alreadyRead = mod ? progressOf(mod.id).theoryRead : false

const progress = computed(() => (finished.value ? 1 : (idx.value + 1) / (sections.length + 1)))

const contentEl = ref<HTMLElement | null>(null)
function go(i: number) {
  idx.value = Math.max(0, Math.min(sections.length - 1, i))
  sfx.tap()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function finish() {
  if (!mod) return
  saving.value = true
  try {
    const res = await markTheoryRead(mod.id)
    xpGain.value = res.xpGain
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
  finished.value = true
  sfx.complete()
  window.scrollTo({ top: 0 })
}

function close() {
  navigateTo('/')
}
</script>

<template>
  <template v-if="mod">
    <FocusTopBar :progress="progress" @close="close" />

    <!-- Leitura -->
    <template v-if="!finished">
      <nav class="chips">
        <button
          v-for="(s, i) in sections"
          :key="s.id"
          class="chip-btn"
          :class="{ on: i === idx, seen: i < idx }"
          @click="go(i)"
        >
          {{ s.id }}
        </button>
      </nav>

      <article :key="section.id" ref="contentEl" class="content rise-in">
        <p class="eyebrow">Módulo {{ mod.id }} · {{ section.id }}</p>
        <h1>{{ section.title }}</h1>
        <TheoryBlock v-for="(b, i) in section.blocks" :key="i" :block="b" />
      </article>

      <footer class="footer">
        <div class="footer-inner">
          <button class="btn btn-ghost nav-btn" :disabled="idx === 0" aria-label="Anterior" @click="go(idx - 1)">
            <ArrowLeft :size="20" :stroke-width="3" />
          </button>
          <button v-if="idx < sections.length - 1" class="btn grow" @click="go(idx + 1)">
            Próximo <ArrowRight :size="20" :stroke-width="3" />
          </button>
          <button v-else class="btn btn-success grow" :disabled="saving" @click="finish">
            Concluir leitura
          </button>
        </div>
      </footer>
    </template>

    <!-- Fim da leitura -->
    <section v-else class="done">
      <div class="done-icon pop-in"><BookOpenCheck :size="56" :stroke-width="2.2" /></div>
      <h1>Leitura concluída!</h1>
      <p class="muted">Agora coloque o conhecimento em prática nos exercícios.</p>
      <div v-if="xpGain > 0" class="xp pop-in" style="animation-delay: 0.2s">
        <Zap :size="22" fill="currentColor" /> +{{ xpGain }} XP
      </div>
      <p v-else-if="alreadyRead" class="muted small">Revisar também conta para a sua ofensiva.</p>

      <div class="done-actions">
        <NuxtLink :to="`/modulo/${mod.id}/praticar`" class="btn btn-success btn-block">Praticar agora</NuxtLink>
        <NuxtLink to="/" class="btn-plain">Voltar à trilha</NuxtLink>
      </div>
    </section>
  </template>
</template>

<style scoped>
.chips {
  display: flex;
  gap: 6px;
  justify-content: center;
  flex-wrap: wrap;
  padding: 4px 16px 0;
}

.chip-btn {
  border: 2px solid var(--border);
  background: var(--surface);
  border-radius: var(--r-sm);
  padding: 4px 10px;
  font-weight: 900;
  font-size: 13px;
  color: var(--muted);
}

.chip-btn.seen {
  color: var(--success);
  border-color: color-mix(in srgb, var(--success) 40%, var(--border));
}

.chip-btn.on {
  background: var(--primary-fill);
  border-color: var(--primary-shadow);
  color: var(--on-primary);
}

.content {
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
  padding: 24px 16px 140px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.eyebrow {
  font-size: 13px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--primary);
}

h1 {
  font-size: 30px;
  margin-top: -10px;
}

.footer {
  position: fixed;
  inset: auto 0 0 0;
  background: var(--surface);
  border-top: 2px solid var(--border);
  padding: 14px 16px calc(14px + env(safe-area-inset-bottom));
}

.footer-inner {
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  gap: 12px;
}

.nav-btn {
  padding: 12px 18px;
}

.grow {
  flex: 1;
}

.done {
  flex: 1;
  width: 100%;
  max-width: 440px;
  margin: 0 auto;
  padding: 40px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 12px;
}

.done-icon {
  width: 112px;
  height: 112px;
  display: grid;
  place-items: center;
  border-radius: var(--r-xl);
  background: var(--primary-fill);
  color: var(--on-primary);
  box-shadow: 0 6px 0 var(--primary-shadow);
  margin-bottom: 12px;
}

.done h1 {
  margin: 0;
}

.xp {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: var(--r-md);
  background: var(--gold-soft);
  color: var(--gold-dark);
  font-weight: 900;
  font-size: 20px;
  margin-top: 8px;
}

.small {
  font-size: 14px;
}

.done-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
}
</style>
