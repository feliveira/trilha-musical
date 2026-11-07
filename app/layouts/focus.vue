<!-- Layout sem navegação, para lições e leitura de teoria -->
<template>
  <div class="focus">
    <slot />
  </div>
</template>

<style scoped>
.focus {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}
</style>
