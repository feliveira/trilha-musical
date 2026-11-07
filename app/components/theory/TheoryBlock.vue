<script setup lang="ts">
import { Lightbulb, TriangleAlert } from 'lucide-vue-next'
import type { TheoryBlock } from '#shared/types'

defineProps<{ block: TheoryBlock }>()
const FAMILY_COLORS = ['--fam-7', '--fam-6', '--fam-5', '--fam-4']
</script>

<template>
  <p v-if="block.kind === 'p'" class="para"><RichText :text="block.text" /></p>

  <div v-else-if="block.kind === 'def'" class="def">
    <p class="def-term">{{ block.term }}</p>
    <p><RichText :text="block.text" /></p>
  </div>

  <div v-else-if="block.kind === 'tip'" class="callout tip">
    <Lightbulb :size="22" :stroke-width="2.4" />
    <p><RichText :text="block.text" /></p>
  </div>

  <div v-else-if="block.kind === 'warn'" class="callout warn">
    <TriangleAlert :size="22" :stroke-width="2.4" />
    <p><RichText :text="block.text" /></p>
  </div>

  <TheorySoundWave v-else-if="block.kind === 'wave'" />

  <div v-else-if="block.kind === 'instruments'" class="families">
    <div
      v-for="(f, i) in block.families"
      :key="f.name"
      class="family"
      :style="{ '--c': `var(${FAMILY_COLORS[i % FAMILY_COLORS.length]})` }"
    >
      <p class="fam-name">{{ f.name }} <span>{{ f.items.length }}</span></p>
      <div class="fam-items">
        <span v-for="it in f.items" :key="it" class="fam-item">{{ it }}</span>
      </div>
    </div>
  </div>

  <TheorySoundCards v-else-if="block.kind === 'cards'" :items="block.items" />
  <TheoryNoteStaircase v-else-if="block.kind === 'staircase'" />
  <TheoryOctaveKeys v-else-if="block.kind === 'octaves'" />
  <TheoryStaffAnatomy v-else-if="block.kind === 'staffAnatomy'" />
  <TheoryClefExplorer v-else-if="block.kind === 'clefs'" />

  <figure v-else-if="block.kind === 'staff'" class="fig">
    <StaffSvg :spec="block.spec" interactive />
    <figcaption v-if="block.caption" class="muted">{{ block.caption }}</figcaption>
  </figure>
</template>

<style scoped>
.para {
  font-size: 17px;
  line-height: 1.6;
}

.def {
  padding: 16px 18px;
  border-radius: var(--r-md);
  background: var(--primary-soft);
  font-size: 17px;
  line-height: 1.55;
}

.def-term {
  font-size: 13px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--primary);
  margin-bottom: 4px;
}

.callout {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 14px 16px;
  border-radius: var(--r-md);
  font-size: 16px;
}

.callout svg {
  flex: none;
  margin-top: 1px;
}

.tip {
  background: var(--gold-soft);
}

.tip svg {
  color: var(--gold-dark);
}

.warn {
  background: var(--danger-soft);
}

.warn svg {
  color: var(--danger);
}

.families {
  display: grid;
  gap: 10px;
}

@media (min-width: 600px) {
  .families {
    grid-template-columns: 1fr 1fr;
  }
}

.family {
  padding: 14px;
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: var(--r-md);
}

.fam-name {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 900;
  font-size: 16px;
  color: var(--text);
  margin-bottom: 8px;
}

.fam-name span {
  font-size: 12px;
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  display: grid;
  place-items: center;
  border-radius: var(--r-xs);
  background: var(--c);
  color: var(--on-primary);
}

.fam-items {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.fam-item {
  font-size: 13px;
  font-weight: 700;
  padding: 4px 9px;
  border-radius: var(--r-xs);
  background: var(--surface-2);
}

.fig {
  margin: 0;
  padding: 16px;
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: var(--r-md);
}

.fig figcaption {
  margin-top: 10px;
  font-size: 13px;
  text-align: center;
}
</style>
