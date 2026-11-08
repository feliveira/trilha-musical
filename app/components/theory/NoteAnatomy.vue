<script setup lang="ts">
// Partes da nota (colcheia): cabeça, haste e bandeirola — com as regras da haste.
type Part = 'head' | 'stem' | 'flag'
const part = ref<Part | null>(null)

const PARTS: { id: Part; name: string; text: string }[] = [
  { id: 'head', name: 'Cabeça', text: 'Tem forma elíptica (oval). Pode ser vazada ou preenchida.' },
  { id: 'stem', name: 'Haste', text: 'Traço vertical: para cima à direita da cabeça, ou para baixo à esquerda.' },
  { id: 'flag', name: 'Bandeirola ou colchete', text: 'Fica sempre à direita da haste.' },
]
const current = computed(() => PARTS.find((p) => p.id === part.value))

function select(p: Part) {
  part.value = part.value === p ? null : p
}
</script>

<template>
  <div class="anatomy">
    <div class="stage">
      <svg viewBox="-10 -6 150 78" class="big" role="img" aria-label="Colcheia com cabeça, haste e bandeirola">
        <g transform="translate(40 0) scale(1.15)">
          <MusicFigureMark kind="note" :value="8" :x="10" :y="56" stem="up" :part="part" />
        </g>
        <!-- rótulos -->
        <g class="lbl" :class="{ on: part === 'flag' }" @click="select('flag')">
          <line x1="70" y1="31" x2="98" y2="22" />
          <text x="100" y="25">bandeirola</text>
        </g>
        <g class="lbl" :class="{ on: part === 'stem' }" @click="select('stem')">
          <line x1="56" y1="44" x2="22" y2="40" />
          <text x="20" y="43" text-anchor="end">haste</text>
        </g>
        <g class="lbl" :class="{ on: part === 'head' }" @click="select('head')">
          <line x1="42" y1="65" x2="22" y2="65" />
          <text x="20" y="68" text-anchor="end">cabeça</text>
        </g>
      </svg>
    </div>

    <div class="parts">
      <button v-for="p in PARTS" :key="p.id" :class="{ on: part === p.id }" @click="select(p.id)">{{ p.name }}</button>
    </div>
    <p class="desc" :key="part ?? 'none'">
      <template v-if="current"><strong>{{ current.name }}:</strong> {{ current.text }}</template>
      <template v-else>Toque em uma parte para destacá-la.</template>
    </p>

    <div class="rules">
      <div class="rule">
        <svg viewBox="0 0 44 64" class="mini"><MusicFigureMark kind="note" :value="8" :x="15" :y="50" stem="up" /></svg>
        <p><strong>Haste para cima</strong>, à direita da cabeça</p>
      </div>
      <div class="rule">
        <svg viewBox="0 0 44 64" class="mini"><MusicFigureMark kind="note" :value="8" :x="22" :y="12" stem="down" /></svg>
        <p><strong>Haste para baixo</strong>, à esquerda da cabeça</p>
      </div>
    </div>
    <p class="muted foot">Nos dois casos, a bandeirola fica à <strong>direita</strong> da haste.</p>
  </div>
</template>

<style scoped>
.anatomy {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: var(--r-md);
}

.stage {
  display: flex;
  justify-content: center;
}

.big {
  width: 100%;
  max-width: 360px;
  color: var(--text);
  overflow: visible;
}

.lbl {
  cursor: pointer;
}

.lbl line {
  stroke: var(--faint);
  stroke-width: 1;
  stroke-dasharray: 2 2;
}

.lbl text {
  font-size: 9px;
  font-weight: 800;
  fill: var(--muted);
}

.lbl.on line {
  stroke: var(--primary);
}

.lbl.on text {
  fill: var(--primary);
}

.parts {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
}

.parts button {
  padding: 8px 12px;
  border: 2px solid var(--border);
  border-radius: var(--r-sm);
  background: var(--surface);
  font-weight: 800;
  font-size: 14px;
  color: var(--muted);
  box-shadow: 0 3px 0 var(--border);
}

.parts button.on {
  border-color: var(--primary);
  background: var(--primary-soft);
  color: var(--primary-dark);
  box-shadow: 0 3px 0 var(--primary-shadow);
}

.desc {
  text-align: center;
  min-height: 48px;
  font-size: 15px;
  animation: rise-in 0.25s ease;
}

.rules {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.rule {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: var(--r-sm);
  background: var(--surface-2);
  font-size: 13px;
}

.mini {
  flex: none;
  width: 32px;
  height: 46px;
  color: var(--text);
  overflow: visible;
}

.foot {
  text-align: center;
  font-size: 13px;
}
</style>
