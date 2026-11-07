<script setup lang="ts">
import { Play, Volume2 } from 'lucide-vue-next'
import type { SoundDemo } from '#shared/types'

defineProps<{ items: { title: string; text: string; play?: SoundDemo }[] }>()

const { playDemo } = useAudio()
const playing = ref<string | null>(null)
let timer: ReturnType<typeof setTimeout> | null = null

function play(title: string, kind: SoundDemo) {
  if (timer) clearTimeout(timer)
  playing.value = title
  const ms = playDemo(kind)
  timer = setTimeout(() => (playing.value = null), ms)
}

const COLORS = ['--fam-4', '--fam-5', '--fam-6', '--fam-7']
</script>

<template>
  <div class="cards">
    <div v-for="(it, i) in items" :key="it.title" class="scard" :style="{ '--c': `var(${COLORS[i % COLORS.length]})` }">
      <div class="top">
        <h3>{{ it.title }}</h3>
        <button v-if="it.play" class="listen" :class="{ on: playing === it.title }" @click="play(it.title, it.play)">
          <component :is="playing === it.title ? Volume2 : Play" :size="16" :fill="playing === it.title ? 'none' : 'currentColor'" :stroke-width="2.6" />
          Ouvir
        </button>
      </div>
      <p><RichText :text="it.text" /></p>
    </div>
  </div>
</template>

<style scoped>
.cards {
  display: grid;
  gap: 12px;
}

.scard {
  padding: 16px;
  border: 2px solid var(--border);
  border-left: 6px solid var(--c);
  border-radius: var(--r-md);
  background: var(--surface);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

h3 {
  font-size: 19px;
  color: var(--text);
}

.listen {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border: 2px solid var(--border);
  background: var(--surface);
  border-radius: var(--r-sm);
  font-weight: 900;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--primary-dark);
  box-shadow: 0 3px 0 var(--border);
  transition: transform 0.08s, box-shadow 0.08s;
}

.listen:active {
  transform: translateY(3px);
  box-shadow: none;
}

.listen.on {
  background: var(--c);
  border-color: var(--c);
  color: var(--on-primary);
}

p {
  font-size: 15px;
  color: var(--text);
}
</style>
