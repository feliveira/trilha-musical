<script setup lang="ts">
// Desenha uma figura (nota ou pausa) dentro de um <svg>, na escala da pauta (12 px entre linhas).
import type { FigureValue } from '#shared/types'

const props = withDefaults(
  defineProps<{
    kind: 'note' | 'rest'
    value: FigureValue
    x: number
    /** Nota: centro da cabeça. Pausa: centro da pausa (linha do meio da pauta). */
    y: number
    stem?: 'up' | 'down'
    /** Pausas de semibreve/mínima precisam de uma linha de referência curta */
    refLine?: boolean
    /** Destaca uma parte da nota (aula de partes da nota) */
    part?: 'head' | 'stem' | 'flag' | null
    /** Omite as bandeirolas (quando a nota é ligada por traço) */
    noFlag?: boolean
    stemLength?: number
  }>(),
  { stem: 'up', refLine: false, part: null, noFlag: false, stemLength: undefined },
)

const { centerAt } = useGlyphMetrics()

const info = computed(() => figureInfo(props.value))
const hollow = computed(() => props.value <= 2)
const hasStem = computed(() => props.value >= 2)
const dir = computed<1 | -1>(() => (props.stem === 'up' ? 1 : -1))
const stemLen = computed(() => props.stemLength ?? 35 + Math.max(0, info.value.flags - 2) * 9)
const stemX = computed(() => (props.stem === 'up' ? props.x + 6.3 : props.x - 6.3))
const stemEnd = computed(() => props.y - dir.value * stemLen.value)

const flags = computed(() => {
  if (props.noFlag) return []
  return Array.from({ length: info.value.flags }, (_, i) =>
    flagPath(stemX.value, stemEnd.value + dir.value * i * 9, dir.value),
  )
})

// pausas
const restGlyph = computed(() => REST_GLYPH[props.value])
const restPos = computed(() => (restGlyph.value ? centerAt(restGlyph.value, props.x, props.y) : null))
</script>

<template>
  <g class="figure" :class="part ? `focus-${part}` : ''">
    <template v-if="kind === 'note'">
      <ellipse
        v-if="value === 1"
        :cx="x"
        :cy="y"
        rx="8.2"
        ry="5.3"
        class="head hollow"
        stroke-width="3.2"
        :transform="`rotate(-12 ${x} ${y})`"
      />
      <ellipse
        v-else
        :cx="x"
        :cy="y"
        rx="7.2"
        ry="5.1"
        class="head"
        :class="{ hollow }"
        :stroke-width="hollow ? 2.2 : 0"
        :transform="`rotate(-20 ${x} ${y})`"
      />
      <line
        v-if="hasStem"
        class="stem"
        :x1="stemX"
        :x2="stemX"
        :y1="y - dir * 1"
        :y2="stemEnd"
      />
      <path v-for="(d, i) in flags" :key="i" :d="d" class="flag" />
    </template>

    <template v-else>
      <template v-if="value === 1 || value === 2">
        <line v-if="refLine" :x1="x - 13" :x2="x + 13" :y1="y" :y2="y" class="refline" />
        <!-- semibreve: pendurada na linha; mínima: apoiada na linha -->
        <rect :x="x - 7.5" :y="value === 1 ? y : y - 5.5" width="15" height="5.5" class="rest-block" />
      </template>
      <text v-else-if="restPos" :x="restPos.x" :y="restPos.y" class="rest-glyph music">{{ restGlyph }}</text>
    </template>
  </g>
</template>

<style scoped>
.head {
  fill: currentColor;
  stroke: currentColor;
}

.head.hollow {
  fill: none;
}

.stem {
  stroke: currentColor;
  stroke-width: 1.6;
}

.flag,
.rest-block {
  fill: currentColor;
}

.refline {
  stroke: currentColor;
  stroke-width: 1.2;
  opacity: 0.6;
}

.rest-glyph {
  font-size: 48px;
  fill: currentColor;
}

/* destaque das partes */
.focus-head .head,
.focus-stem .stem,
.focus-flag .flag {
  color: var(--primary);
  stroke: var(--primary);
}

.focus-head .head:not(.hollow),
.focus-flag .flag {
  fill: var(--primary);
}

.focus-stem .stem {
  stroke-width: 3;
}

.focus-head .head,
.focus-stem .stem,
.focus-flag .flag {
  filter: drop-shadow(0 0 3px color-mix(in srgb, var(--primary) 60%, transparent));
}

.focus-head .stem,
.focus-head .flag,
.focus-stem .head,
.focus-stem .flag,
.focus-flag .head,
.focus-flag .stem {
  opacity: 0.35;
}
</style>
