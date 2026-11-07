<script setup lang="ts">
import { Play } from 'lucide-vue-next'

const { playMidi } = useAudio()
const active = ref<number | null>(null)
const COLORS = ['--fam-1', '--fam-2', '--fam-3', '--fam-4', '--fam-5', '--fam-6', '--fam-7']
let timers: ReturnType<typeof setTimeout>[] = []

function hit(i: number) {
  playMidi(cMajorMidi(i), 0.6)
  active.value = i
  timers.push(setTimeout(() => active.value === i && (active.value = null), 350))
}

function playAll() {
  timers.forEach(clearTimeout)
  timers = []
  for (let i = 0; i < 7; i++) timers.push(setTimeout(() => hit(i), i * 330))
}

onBeforeUnmount(() => timers.forEach(clearTimeout))
</script>

<template>
  <div class="stairs-wrap">
    <div class="stairs">
      <button
        v-for="(name, i) in NOTE_NAMES"
        :key="name"
        class="step"
        :class="{ active: active === i }"
        :style="{ '--h': `${34 + i * 16}px`, '--c': `var(${COLORS[i]})` }"
        @click="hit(i)"
      >
        <span>{{ name }}</span>
      </button>
    </div>
    <div class="axis muted">
      <span>grave</span>
      <span class="arrow" />
      <span>agudo</span>
    </div>
    <button class="btn btn-ghost play" @click="playAll"><Play :size="18" fill="currentColor" /> Ouvir a escada</button>
  </div>
</template>

<style scoped>
.stairs-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: stretch;
}

.stairs {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  align-items: end;
  gap: 6px;
  height: 150px;
}

.step {
  height: var(--h);
  border: 0;
  border-radius: var(--r-sm) var(--r-sm) var(--r-xs) var(--r-xs);
  background: var(--c);
  color: var(--on-primary);
  font-weight: 900;
  font-size: 14px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 8px;
  box-shadow: 0 4px 0 color-mix(in srgb, var(--on-primary) 22%, var(--c));
  transition:
    transform 0.1s,
    box-shadow 0.1s;
}

@media (min-width: 480px) {
  .step {
    font-size: 16px;
  }
}

.step.active {
  transform: translateY(-8px);
  box-shadow: 0 12px 0 color-mix(in srgb, var(--on-primary) 22%, var(--c));
}

.axis {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.arrow {
  flex: 1;
  height: 2px;
  background: var(--border-strong);
  position: relative;
}

.arrow::after {
  content: '';
  position: absolute;
  right: 0;
  top: -4px;
  border-left: 8px solid var(--border-strong);
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
}

.play {
  align-self: center;
  min-height: 46px;
  font-size: 14px;
}
</style>
