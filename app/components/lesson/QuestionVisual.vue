<script setup lang="ts">
import type { Visual } from '#shared/types'

withDefaults(defineProps<{ visual: Visual; size?: number }>(), { size: 64 })
</script>

<template>
  <StaffSvg v-if="visual.type === 'staff'" :spec="visual.spec" :max-width="360" />

  <div v-else-if="visual.type === 'figures'" class="figs">
    <template v-for="(f, i) in visual.items" :key="i">
      <span v-if="visual.join && i > 0" class="plus">+</span>
      <MusicFigureIcon :kind="f.kind" :value="f.value" :size="size * 1.3" />
    </template>
  </div>

  <MusicRhythmStaff v-else-if="visual.type === 'rhythm'" :spec="visual.spec" :max-width="440" />

  <div v-else-if="visual.type === 'timeSig'" class="tsig" :style="{ fontSize: `${size * 0.7}px` }">
    <span>{{ visual.top }}</span><span>{{ visual.bottom }}</span>
  </div>

  <MusicBeamedNotes v-else-if="visual.type === 'beams'" :values="visual.values" :size="size" />

  <svg v-else-if="visual.type === 'noteParts'" viewBox="0 0 44 64" class="parts" :style="{ height: `${size * 1.4}px` }">
    <MusicFigureMark kind="note" :value="8" :x="15" :y="50" stem="up" :part="visual.highlight" />
  </svg>

  <svg v-else-if="visual.type === 'barline'" viewBox="0 0 60 56" class="barline" :style="{ height: `${size}px` }">
    <line v-for="k in 5" :key="k" x1="0" x2="60" :y1="4 + (k - 1) * 12" :y2="4 + (k - 1) * 12" class="ln" />
    <line v-if="visual.style !== 'final'" x1="27" x2="27" y1="4" y2="52" class="bl" />
    <line v-if="visual.style === 'double'" x1="33" x2="33" y1="4" y2="52" class="bl" />
    <template v-if="visual.style === 'final'">
      <line x1="25" x2="25" y1="4" y2="52" class="bl" />
      <rect x="30" y="4" width="5" height="48" class="bk" />
    </template>
  </svg>
</template>

<style scoped>
.figs {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
}

.plus {
  font-size: 24px;
  font-weight: 900;
  color: var(--faint);
  margin: 0 2px;
}

.tsig {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 0.95;
  font-weight: 900;
}

.parts,
.barline {
  display: block;
  margin: 0 auto;
  overflow: visible;
  color: var(--text);
}

.ln {
  stroke: currentColor;
  stroke-width: 1;
  opacity: 0.5;
}

.bl {
  stroke: currentColor;
  stroke-width: 1.6;
}

.bk {
  fill: currentColor;
}
</style>
