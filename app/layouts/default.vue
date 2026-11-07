<template>
  <div class="shell">
    <AppHeader />
    <main class="main">
      <slot />
    </main>
    <BottomNav />
  </div>
</template>

<style scoped>
.shell {
  min-height: 100dvh;
}

.main {
  padding: calc(var(--header-h) + 16px) 16px calc(var(--nav-h) + 32px + env(safe-area-inset-bottom));
}

@media (min-width: 900px) {
  .main {
    padding-bottom: 48px;
  }
}
</style>
