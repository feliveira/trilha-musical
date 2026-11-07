<script setup lang="ts">
defineProps<{ title: string; text: string; confirmLabel: string; cancelLabel: string }>()
const emit = defineEmits<{ confirm: []; cancel: [] }>()
</script>

<template>
  <div class="backdrop" @click.self="emit('cancel')">
    <div class="dialog pop-in" role="alertdialog">
      <h2>{{ title }}</h2>
      <p class="muted">{{ text }}</p>
      <button class="btn btn-block" @click="emit('cancel')">{{ cancelLabel }}</button>
      <button class="btn-plain danger" @click="emit('confirm')">{{ confirmLabel }}</button>
    </div>
  </div>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  place-items: center;
  padding: 16px;
  background: var(--backdrop);
}

.dialog {
  width: 100%;
  max-width: 380px;
  background: var(--surface);
  border-radius: var(--r-xl);
  padding: 28px 22px 18px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

h2 {
  font-size: 22px;
}

p {
  margin-bottom: 8px;
}

.danger {
  color: var(--danger);
}

.danger:hover {
  background: var(--danger-soft);
}
</style>
