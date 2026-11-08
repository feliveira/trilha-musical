<script setup lang="ts">
// Grupo de colcheias/semicolcheias ligadas por traço (barra de ligação).
const props = withDefaults(defineProps<{ values: (8 | 16)[]; size?: number }>(), { size: 64 })

const STEP = 26
const HEAD_Y = 50
const TOP = 12
const THICK = 5
const width = computed(() => 14 + (props.values.length - 1) * STEP + 20)
const xs = computed(() => props.values.map((_, i) => 12 + i * STEP))
const stemX = (i: number) => xs.value[i]! + 6.3

/** Segmentos do 2º traço: semicolcheias vizinhas são ligadas; uma isolada ganha um traço curto */
const secondary = computed(() => {
  const segs: [number, number][] = []
  const v = props.values
  let i = 0
  while (i < v.length) {
    if (v[i] !== 16) {
      i++
      continue
    }
    let j = i
    while (j + 1 < v.length && v[j + 1] === 16) j++
    if (j > i) segs.push([stemX(i), stemX(j)])
    else if (i === v.length - 1) segs.push([stemX(i) - 10, stemX(i)])
    else segs.push([stemX(i), stemX(i) + 10])
    i = j + 1
  }
  return segs
})
</script>

<template>
  <svg
    class="beamed"
    :viewBox="`0 0 ${width} 64`"
    :width="(size * width) / 64"
    :height="size"
    role="img"
    aria-label="Figuras ligadas por traço"
  >
    <g v-for="(v, i) in values" :key="i">
      <MusicFigureMark kind="note" :value="v" :x="xs[i]!" :y="HEAD_Y" no-flag :stem-length="HEAD_Y - TOP" />
    </g>
    <rect :x="stemX(0) - 0.8" :y="TOP" :width="stemX(values.length - 1) - stemX(0) + 1.6" :height="THICK" class="beam" />
    <rect v-for="(s, i) in secondary" :key="i" :x="s[0] - 0.8" :y="TOP + 8" :width="s[1] - s[0] + 1.6" :height="THICK" class="beam" />
  </svg>
</template>

<style scoped>
.beamed {
  display: inline-block;
  overflow: visible;
  color: var(--text);
  vertical-align: middle;
}

.beam {
  fill: currentColor;
}
</style>
