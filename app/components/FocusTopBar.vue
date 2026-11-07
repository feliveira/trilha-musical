<script setup lang="ts">
import { X } from 'lucide-vue-next'

defineProps<{ progress: number }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <div class="topbar">
    <button class="icon-btn" aria-label="Sair" @click="emit('close')"><X :size="26" :stroke-width="2.6" /></button>
    <div class="progress" role="progressbar" :aria-valuenow="Math.round(progress * 100)" aria-valuemin="0" aria-valuemax="100">
      <span :style="{ width: `${Math.max(4, progress * 100)}%` }" />
    </div>
    <slot />
  </div>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 16px 16px 8px;
}

.progress {
  flex: 1;
}
</style>
