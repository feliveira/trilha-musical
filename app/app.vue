<script setup lang="ts">
const { user, ready, init } = useUser()
onMounted(init)
</script>

<template>
  <div>
    <div v-if="!ready" class="boot">
      <span class="music boot-note">&#x1D160;</span>
    </div>
    <template v-else>
      <NuxtLayout>
        <NuxtPage v-if="user" />
      </NuxtLayout>
      <Transition name="fade">
        <LoginModal v-if="!user" />
      </Transition>
    </template>
  </div>
</template>

<style scoped>
.boot {
  min-height: 100dvh;
  display: grid;
  place-items: center;
}
.boot-note {
  font-size: 56px;
  color: var(--primary);
  animation: pop-in 0.8s ease infinite alternate;
}
</style>
