<script setup lang="ts">
import { Ear, Play } from 'lucide-vue-next'

const { playMidi } = useAudio()
const playing = ref(false)

function play() {
  playMidi(69, 1.4)
  playing.value = true
  setTimeout(() => (playing.value = false), 1400)
}

// Onda senoidal simples
const path = computed(() => {
  const pts: string[] = []
  for (let x = 0; x <= 240; x += 4) {
    pts.push(`${x},${30 + Math.sin((x / 240) * Math.PI * 6) * 16}`)
  }
  return `M${pts.join(' L')}`
})
</script>

<template>
  <button class="wave-card" :class="{ playing }" @click="play">
    <span class="src"><Play :size="20" fill="currentColor" /></span>
    <svg viewBox="0 0 240 60" preserveAspectRatio="none" class="wave" aria-hidden="true">
      <path :d="path" />
    </svg>
    <span class="ear"><Ear :size="26" :stroke-width="2.4" /></span>
  </button>
</template>

<style scoped>
.wave-card {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  border: 2px dashed var(--border-strong);
  border-radius: var(--r-md);
  background: var(--surface);
}

.src,
.ear {
  flex: none;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: var(--r-sm);
}

.src {
  background: var(--primary-fill);
  color: var(--on-primary);
}

.ear {
  background: var(--primary-soft);
  color: var(--primary);
}

.wave {
  flex: 1;
  min-width: 0;
  height: 48px;
  overflow: hidden;
}

.wave path {
  fill: none;
  stroke: var(--primary);
  stroke-width: 3;
  stroke-linecap: round;
  vector-effect: non-scaling-stroke;
  stroke-dasharray: 8 8;
  animation: flow 1.2s linear infinite;
  animation-play-state: paused;
}

.playing .wave path {
  animation-play-state: running;
}

.playing .ear {
  animation: pop-in 0.5s ease;
}

@keyframes flow {
  to {
    stroke-dashoffset: -32;
  }
}
</style>
