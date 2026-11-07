<script setup lang="ts">
import type { FillQuestion } from '#shared/types'

const props = defineProps<{
  q: FillQuestion
  bank: string[]
  /** Índice da palavra do banco em cada lacuna */
  slots: (number | null)[]
  locked: boolean
}>()
const emit = defineEmits<{ 'update:slots': [v: (number | null)[]] }>()
const { sfx } = useAudio()

const pieces = computed(() => props.q.text.split('___'))
const used = computed(() => new Set(props.slots.filter((s): s is number => s !== null)))

const norm = (s: string) => s.trim().toLowerCase()

function slotState(i: number) {
  if (!props.locked) return props.slots[i] === null ? 'empty' : 'filled'
  const b = props.slots[i]
  return b !== null && b !== undefined && norm(props.bank[b]!) === norm(props.q.answers[i]!) ? 'correct' : 'wrong'
}

function pick(b: number) {
  if (props.locked || used.value.has(b)) return
  const next = props.slots.slice()
  const empty = next.indexOf(null)
  if (empty === -1) return
  next[empty] = b
  sfx.tap()
  emit('update:slots', next)
}

function unpick(i: number) {
  if (props.locked || props.slots[i] === null) return
  const next = props.slots.slice()
  next[i] = null
  sfx.tap()
  emit('update:slots', next)
}
</script>

<template>
  <div class="fill">
    <p class="sentence">
      <template v-for="(piece, i) in pieces" :key="i">
        <span>{{ piece }}</span>
        <button
          v-if="i < pieces.length - 1"
          class="slot"
          :class="slotState(i)"
          :disabled="locked || slots[i] === null"
          @click="unpick(i)"
        >
          {{ slots[i] !== null ? bank[slots[i]!] : '' }}
        </button>
      </template>
    </p>

    <div class="bank">
      <button
        v-for="(w, b) in bank"
        :key="b"
        class="word"
        :class="{ used: used.has(b) }"
        :disabled="locked || used.has(b)"
        @click="pick(b)"
      >
        <span>{{ w }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.fill {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.sentence {
  font-size: 21px;
  font-weight: 700;
  line-height: 2.3;
}

.slot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 96px;
  height: 44px;
  margin: 0 4px;
  padding: 0 14px;
  vertical-align: middle;
  border-radius: var(--r-sm);
  font-size: 18px;
  font-weight: 800;
  line-height: 1;
  transition: all 0.15s;
}

.slot.empty {
  border: 0;
  border-bottom: 3px solid var(--border-strong);
  border-radius: 0;
  background: transparent;
  corner-shape: round;
}

.slot.filled {
  border: 2px solid var(--border);
  background: var(--surface);
  box-shadow: 0 3px 0 var(--border);
  animation: pop-in 0.25s ease;
}

.slot.correct {
  border: 2px solid var(--success);
  background: var(--success-soft);
  color: var(--success-dark);
}

.slot.wrong {
  border: 2px solid var(--danger);
  background: var(--danger-soft);
  color: var(--danger-dark);
  animation: shake 0.4s ease;
}


.bank {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.word {
  min-height: 50px;
  padding: 10px 18px;
  border: 2px solid var(--border);
  background: var(--surface);
  border-radius: var(--r-md);
  box-shadow: 0 4px 0 var(--border);
  font-size: 17px;
  font-weight: 800;
  transition:
    transform 0.08s,
    box-shadow 0.08s;
  margin-bottom: 4px;
}

.word:active:not(:disabled) {
  transform: translateY(4px);
  box-shadow: 0 0 0 var(--border);
}

.word.used {
  background: var(--locked);
  border-color: var(--locked);
  box-shadow: 0 4px 0 var(--locked);
}

.word.used span {
  visibility: hidden;
}
</style>
