<script setup lang="ts">
// Figura isolada (fora da pauta), usada em tabelas, opções e jogos.
import type { FigureValue } from '#shared/types'

const props = withDefaults(defineProps<{ kind: 'note' | 'rest'; value: FigureValue; size?: number }>(), { size: 56 })

const VB_W = 40
const VB_H = 64
const isRest = computed(() => props.kind === 'rest')
const restY = 32
const noteY = computed(() => (props.value === 1 ? 34 : props.value >= 32 ? 56 : 50))
const noteX = computed(() => (props.value === 1 ? 20 : 15))
</script>

<template>
  <svg
    class="fig-icon"
    :viewBox="`0 0 ${VB_W} ${VB_H}`"
    :width="(size * VB_W) / VB_H"
    :height="size"
    role="img"
    :aria-label="isRest ? figureInfo(value).restName : figureInfo(value).name"
  >
    <MusicFigureMark
      v-if="isRest"
      kind="rest"
      :value="value"
      :x="20"
      :y="value <= 2 ? 30 : restY"
      ref-line
    />
    <MusicFigureMark v-else kind="note" :value="value" :x="noteX" :y="noteY" stem="up" />
  </svg>
</template>

<style scoped>
.fig-icon {
  display: inline-block;
  overflow: visible;
  color: var(--text);
  vertical-align: middle;
}
</style>
