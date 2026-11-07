<script setup lang="ts">
import type { ChoiceQuestion } from '#shared/types'

const props = defineProps<{
  q: ChoiceQuestion
  order: number[]
  selected: number | null
  locked: boolean
}>()
const emit = defineEmits<{ select: [i: number] }>()

function stateOf(displayIdx: number) {
  if (!props.locked) return props.selected === displayIdx ? 'selected' : ''
  const original = props.order[displayIdx]
  if (original === props.q.answer) return 'correct'
  if (props.selected === displayIdx) return 'wrong'
  return 'dim'
}
</script>

<template>
  <div class="choice">
    <div v-if="q.staff" class="visual">
      <StaffSvg :spec="q.staff" :max-width="q.staff.notes?.length ? 360 : 260" />
    </div>
    <div v-else-if="q.glyph" class="visual glyph music">{{ q.glyph }}</div>

    <div class="options" :class="{ grid: order.every((o) => q.options[o]!.length < 18) }">
      <button
        v-for="(o, i) in order"
        :key="o"
        class="opt"
        :class="stateOf(i)"
        :disabled="locked"
        @click="emit('select', i)"
      >
        <span class="key">{{ i + 1 }}</span>
        <span class="txt">{{ q.options[o] }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.choice {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.visual {
  padding: 18px 12px;
  border: 2px solid var(--border);
  border-radius: var(--r-lg);
}

.glyph {
  font-size: 80px;
  text-align: center;
  line-height: 1.2;
}

.options {
  display: grid;
  gap: 10px;
}

.options.grid {
  grid-template-columns: 1fr 1fr;
}

.opt {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 60px;
  padding: 12px 14px;
  text-align: left;
  border: 2px solid var(--border);
  border-radius: var(--r-md);
  background: var(--surface);
  box-shadow: 0 4px 0 var(--border);
  font-weight: 700;
  font-size: 16px;
  line-height: 1.3;
  transition:
    transform 0.08s,
    box-shadow 0.08s,
    background 0.15s,
    border-color 0.15s;
  margin-bottom: 4px;
}

.opt:hover:not(:disabled) {
  background: var(--surface-2);
}

.opt:active:not(:disabled) {
  transform: translateY(4px);
  box-shadow: 0 0 0 var(--border);
}

.key {
  flex: none;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border: 2px solid var(--border);
  border-radius: var(--r-xs);
  font-size: 13px;
  font-weight: 900;
  color: var(--muted);
}

.opt.selected {
  border-color: var(--primary);
  background: var(--primary-soft);
  box-shadow: 0 4px 0 color-mix(in srgb, var(--primary) 55%, var(--border));
  color: var(--primary);
}

.opt.selected .key {
  border-color: var(--primary);
  color: var(--primary);
}

.opt.correct {
  border-color: var(--success);
  background: var(--success-soft);
  box-shadow: 0 4px 0 var(--success-shadow);
  color: var(--success-dark);
  animation: pop-in 0.35s ease;
}

.opt.correct .key {
  border-color: var(--success);
  color: var(--success);
}

.opt.wrong {
  border-color: var(--danger);
  background: var(--danger-soft);
  box-shadow: 0 4px 0 var(--danger-shadow);
  color: var(--danger-dark);
  animation: shake 0.4s ease;
}

.opt.wrong .key {
  border-color: var(--danger);
  color: var(--danger);
}

.opt.dim {
  opacity: 0.5;
}


</style>
