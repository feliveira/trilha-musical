<script setup lang="ts">
import { Star } from 'lucide-vue-next'

withDefaults(defineProps<{ count: number; size?: number; animate?: boolean }>(), { size: 16, animate: false })
</script>

<template>
  <div class="stars">
    <Star
      v-for="i in 3"
      :key="i"
      :size="size"
      :stroke-width="2.5"
      :class="['star', { on: i <= count, anim: animate && i <= count }]"
      :style="animate ? { animationDelay: `${0.25 + i * 0.22}s` } : undefined"
      :fill="i <= count ? 'currentColor' : 'none'"
    />
  </div>
</template>

<style scoped>
.stars {
  display: inline-flex;
  gap: 2px;
}
.star {
  color: var(--locked-dark);
}
.star.on {
  color: var(--gold);
}
.star.anim {
  animation: pop-in 0.5s cubic-bezier(0.3, 1.6, 0.5, 1) both;
}
</style>
