<script setup lang="ts">
import { Route, Trophy, User, Gamepad2 } from 'lucide-vue-next'

const items = [
  { to: '/', label: 'Trilha', icon: Route },
  { to: '/ensaio', label: 'Ensaio', icon: Gamepad2 },
  { to: '/ranking', label: 'Ranking', icon: Trophy },
  { to: '/perfil', label: 'Perfil', icon: User },
]
</script>

<template>
  <nav class="bottom-nav">
    <NuxtLink v-for="it in items" :key="it.to" :to="it.to" class="item">
      <span class="icon"><component :is="it.icon" :size="24" :stroke-width="2.5" /></span>
      <span class="label">{{ it.label }}</span>
    </NuxtLink>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  inset: auto 0 0 0;
  z-index: 40;
  display: flex;
  justify-content: space-around;
  height: calc(var(--nav-h) + env(safe-area-inset-bottom));
  padding: 6px 8px env(safe-area-inset-bottom);
  background: var(--surface);
  border-top: 2px solid var(--border);
}

@media (min-width: 900px) {
  .bottom-nav {
    display: none;
  }
}

.item {
  flex: 1;
  max-width: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  color: var(--faint);
  font-size: 12px;
  font-weight: 800;
}

.icon {
  display: grid;
  place-items: center;
  width: 52px;
  height: 34px;
  border-radius: var(--r-sm);
  border: 2px solid transparent;
}

.item.router-link-exact-active {
  color: var(--primary);
}

.item.router-link-exact-active .icon {
  background: var(--primary-soft);
  border-color: color-mix(in srgb, var(--primary) 35%, transparent);
}
</style>
