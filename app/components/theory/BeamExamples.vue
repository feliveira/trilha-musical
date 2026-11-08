<script setup lang="ts">
// Figuras com bandeirola, quando juntas, podem ser ligadas por traço.
const EXAMPLES: { values: (8 | 16)[]; text: string }[] = [
  { values: [8, 8], text: 'Duas colcheias: 1 traço' },
  { values: [16, 16], text: 'Duas semicolcheias: 2 traços' },
  { values: [8, 16, 16], text: 'Colcheia + 2 semicolcheias' },
  { values: [16, 16, 16, 16], text: 'Quatro semicolcheias' },
]
</script>

<template>
  <div class="beams">
    <div v-for="(ex, i) in EXAMPLES" :key="i" class="ex">
      <div class="sep">
        <MusicFigureIcon v-for="(v, k) in ex.values" :key="k" kind="note" :value="v" :size="54" />
      </div>
      <span class="eq">=</span>
      <MusicBeamedNotes :values="ex.values" :size="54" class="joined" />
      <p class="muted cap">{{ ex.text }}</p>
    </div>
  </div>
</template>

<style scoped>
.beams {
  display: grid;
  gap: 10px;
}

@media (min-width: 600px) {
  .beams {
    grid-template-columns: 1fr 1fr;
  }
}

.ex {
  display: grid;
  grid-template-columns: auto auto auto;
  justify-content: center;
  align-items: center;
  gap: 4px 14px;
  padding: 14px;
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: var(--r-md);
}

.sep {
  display: flex;
  gap: 2px;
}

.eq {
  font-size: 22px;
  font-weight: 900;
  color: var(--faint);
}

.joined {
  color: var(--primary-dark);
}

.cap {
  grid-column: 1 / -1;
  text-align: center;
  font-size: 13px;
}
</style>
