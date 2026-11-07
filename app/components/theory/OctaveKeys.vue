<script setup lang="ts">
// Teclado com 2 grupos de 7 notas + Dó final, mostrando a repetição
const { playMidi } = useAudio()
const active = ref<number | null>(null)

const keys = Array.from({ length: 15 }, (_, i) => ({
  i,
  name: NOTE_NAMES[i % 7]!,
  isC: i % 7 === 0,
  group: Math.floor(i / 7),
}))
// teclas pretas existem depois de Dó, Ré, Fá, Sol, Lá
const hasBlack = (i: number) => [0, 1, 3, 4, 5].includes(i % 7) && i < 14

function hit(i: number) {
  playMidi(cMajorMidi(i), 0.6)
  active.value = i
  setTimeout(() => active.value === i && (active.value = null), 300)
}
</script>

<template>
  <div class="octaves">
    <div class="groups" aria-hidden="true">
      <span class="g g1">1º grupo de 7</span>
      <span class="g g2">2º grupo de 7</span>
    </div>
    <div class="keyboard">
      <button
        v-for="k in keys"
        :key="k.i"
        class="key"
        :class="{ c: k.isC, active: active === k.i, g2: k.group === 1 }"
        :aria-label="k.name"
        @click="hit(k.i)"
      >
        <span v-if="hasBlack(k.i)" class="black" />
        <span class="name">{{ k.name }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.octaves {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.groups {
  display: grid;
  grid-template-columns: 7fr 7fr 1fr;
  gap: 0;
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  text-align: center;
}

.g {
  padding: 4px 0;
  border-radius: var(--r-xs);
  margin: 0 2px;
}

.g1 {
  background: var(--primary-soft);
  color: var(--primary);
}

.g2 {
  background: var(--surface-2);
  color: var(--muted);
}

.keyboard {
  display: grid;
  grid-template-columns: repeat(15, 1fr);
  height: 140px;
  border: 2px solid var(--border-strong);
  border-radius: var(--r-sm);
  overflow: hidden;
  background: var(--border-strong);
  gap: 2px;
}

.key {
  position: relative;
  border: 0;
  background: #fff;
  color: #555;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0 0 8px;
  border-radius: 0 0 6px 6px;
  corner-shape: round;
  transition: background 0.1s;
}

.key .name {
  font-size: 10px;
  font-weight: 800;
}

@media (min-width: 480px) {
  .key .name {
    font-size: 12px;
  }
}

/* teclado é sempre claro, então as cores do Dó são fixas */
.key.c {
  background: #dbe7fa;
  color: #2f5a9e;
}

.key.c.g2 {
  background: #e6eaf0;
  color: #4f5b6e;
}

.key.c .name {
  font-weight: 900;
}

.key.active {
  background: var(--gold-fill) !important;
  color: var(--on-gold) !important;
}

.black {
  position: absolute;
  top: 0;
  right: -32%;
  width: 62%;
  height: 56%;
  background: #3a4558;
  border-radius: 0 0 4px 4px;
  z-index: 2;
  pointer-events: none;
  corner-shape: round;
}
</style>
