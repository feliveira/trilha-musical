<script setup lang="ts">
import type { RhythmSpec } from '#shared/types'

const focus = ref<'top' | 'bottom' | null>(null)

const spec: RhythmSpec = {
  timeSig: [4, 4],
  counts: true,
  items: [
    { t: 'note', v: 4, pos: 2 }, { t: 'note', v: 4, pos: 3 }, { t: 'note', v: 4, pos: 4 }, { t: 'note', v: 4, pos: 3 },
    { t: 'bar', style: 'single' },
    { t: 'note', v: 2, pos: 2 }, { t: 'note', v: 4, pos: 4 }, { t: 'rest', v: 4 },
    { t: 'bar', style: 'single' },
    { t: 'note', v: 1, pos: 2 },
    { t: 'bar', style: 'final' },
  ],
}
</script>

<template>
  <div class="explorer">
    <div class="formula-row">
      <div class="formula" role="group" aria-label="Fórmula de compasso 4 por 4">
        <button class="num" :class="{ on: focus === 'top' }" @click="focus = focus === 'top' ? null : 'top'">4</button>
        <button class="num" :class="{ on: focus === 'bottom' }" @click="focus = focus === 'bottom' ? null : 'bottom'">4</button>
      </div>
      <div class="explain">
        <div class="item" :class="{ on: focus === 'top', dim: focus === 'bottom' }" @click="focus = 'top'">
          <span class="tag">Número de cima</span>
          <p><strong>Quantos tempos</strong> cabem em cada compasso: <strong>4 tempos</strong>.</p>
          <div class="beats"><span v-for="n in 4" :key="n" class="beat">{{ n }}</span></div>
        </div>
        <div class="item" :class="{ on: focus === 'bottom', dim: focus === 'top' }" @click="focus = 'bottom'">
          <span class="tag">Número de baixo</span>
          <p>
            <strong>Qual figura vale 1 tempo</strong>. O 4 é o número da <strong>semínima</strong> na tabela de figuras.
          </p>
          <div class="fig-eq">
            <span class="badge">4</span> =
            <MusicFigureIcon kind="note" :value="4" :size="40" /> semínima
          </div>
        </div>
      </div>
    </div>

    <div class="demo">
      <p class="demo-title">Conte junto: cada compasso soma 4 tempos de semínima</p>
      <MusicRhythmStaff :spec="spec" playable metronome />
    </div>
  </div>
</template>

<style scoped>
.explorer {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: var(--r-md);
}

.formula-row {
  display: flex;
  gap: 16px;
  align-items: stretch;
}

.formula {
  flex: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  padding: 8px 6px;
  border-radius: var(--r-md);
  background: var(--surface-2);
}

.num {
  width: 64px;
  height: 64px;
  border: 2px solid transparent;
  border-radius: var(--r-sm);
  background: transparent;
  font-size: 46px;
  font-weight: 900;
  line-height: 1;
  color: var(--text);
}

.num.on {
  background: var(--primary-fill);
  color: var(--on-primary);
  border-color: var(--primary-shadow);
}

.explain {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.item {
  padding: 10px 12px;
  border: 2px solid var(--border);
  border-radius: var(--r-sm);
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.15s, border-color 0.15s;
}

.item.on {
  border-color: var(--primary);
  background: var(--primary-soft);
}

.item.dim {
  opacity: 0.5;
}

.tag {
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--primary-dark);
}

.beats {
  display: flex;
  gap: 6px;
  margin-top: 6px;
}

.beat {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  corner-shape: round;
  background: var(--primary-fill);
  color: var(--on-primary);
  font-weight: 900;
  font-size: 13px;
}

.fig-eq {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  font-weight: 800;
}

.badge {
  padding: 2px 9px;
  border-radius: var(--r-xs);
  background: var(--primary-fill);
  color: var(--on-primary);
  font-weight: 900;
}

.demo {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.demo-title {
  font-weight: 800;
  font-size: 14px;
  text-align: center;
}
</style>
