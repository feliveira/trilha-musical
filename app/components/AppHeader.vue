<script setup lang="ts">
import { Flame, Zap, LogOut, Volume2, VolumeX, Route, Trophy, User } from 'lucide-vue-next'

const { user, streak, activeToday, logout } = useUser()
const { muted, toggleMute } = useAudio()
const menuOpen = ref(false)

const initial = computed(() => user.value?.email[0]?.toUpperCase() ?? '?')

function onLogout() {
  menuOpen.value = false
  logout()
}
</script>

<template>
  <header class="header">
    <div class="inner">
      <NuxtLink to="/" class="brand">
        <span class="brand-mark music">&#x1D11E;</span>
        <span class="brand-name">Trilha Musical</span>
      </NuxtLink>

      <nav class="desk-nav">
        <NuxtLink to="/" class="nav-link"><Route :size="20" /> Trilha</NuxtLink>
        <NuxtLink to="/ranking" class="nav-link"><Trophy :size="20" /> Ranking</NuxtLink>
      </nav>

      <div class="stats">
        <div class="stat" :class="{ on: activeToday }" :title="activeToday ? 'Ofensiva garantida hoje!' : 'Pratique hoje para manter a ofensiva'">
          <Flame :size="22" :fill="activeToday ? 'currentColor' : 'none'" :stroke-width="2.5" />
          <span>{{ streak }}</span>
        </div>
        <div class="stat xp" title="Pontos de experiência">
          <Zap :size="22" fill="currentColor" :stroke-width="2" />
          <span>{{ user?.xp ?? 0 }}</span>
        </div>

        <div class="menu-wrap">
          <button class="avatar round" aria-label="Menu do usuário" @click="menuOpen = !menuOpen">{{ initial }}</button>
          <Transition name="fade">
            <div v-if="menuOpen" class="menu-backdrop" @click="menuOpen = false" />
          </Transition>
          <Transition name="sheet">
            <div v-if="menuOpen" class="menu">
              <p class="menu-email">{{ user?.email }}</p>
              <NuxtLink to="/perfil" class="menu-item" @click="menuOpen = false"><User :size="18" /> Meu perfil</NuxtLink>
              <button class="menu-item" @click="toggleMute">
                <component :is="muted ? VolumeX : Volume2" :size="18" />
                {{ muted ? 'Ativar efeitos sonoros' : 'Silenciar efeitos' }}
              </button>
              <button class="menu-item danger" @click="onLogout"><LogOut :size="18" /> Sair</button>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 40;
  height: var(--header-h);
  background: var(--surface);
  border-bottom: 2px solid var(--border);
}

.inner {
  height: 100%;
  max-width: 1040px;
  margin: 0 auto;
  padding: 0 12px 0 16px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 900;
  font-size: 19px;
  color: var(--primary);
}

.brand-mark {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  background: var(--primary-fill);
  color: var(--on-primary);
  border-radius: var(--r-sm);
  font-size: 26px;
  line-height: 1;
  padding-top: 3px;
}

.brand-name {
  display: none;
}

@media (min-width: 520px) {
  .brand-name {
    display: inline;
  }
}

.desk-nav {
  display: none;
  gap: 4px;
  margin-left: 12px;
}

@media (min-width: 900px) {
  .desk-nav {
    display: flex;
  }
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: var(--r-sm);
  font-weight: 800;
  color: var(--muted);
  border: 2px solid transparent;
}

.nav-link:hover {
  background: var(--surface-2);
}

.nav-link.router-link-exact-active {
  color: var(--primary);
  background: var(--primary-soft);
  border-color: color-mix(in srgb, var(--primary) 35%, transparent);
}

.stats {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  border-radius: var(--r-sm);
  font-weight: 900;
  font-size: 17px;
  color: var(--faint);
}

.stat.on {
  color: var(--flame-dark);
}

.stat.xp {
  color: var(--gold-dark);
}

.menu-wrap {
  position: relative;
  margin-left: 4px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 0;
  background: var(--primary-soft);
  color: var(--primary);
  font-weight: 900;
  font-size: 17px;
}

.menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1;
}

.menu {
  position: absolute;
  right: 0;
  top: calc(100% + 10px);
  z-index: 2;
  width: 260px;
  padding: 8px;
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: var(--r-md);
  box-shadow: 0 4px 0 var(--border);
}

.menu-email {
  padding: 8px 10px 10px;
  font-size: 13px;
  color: var(--muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-bottom: 2px solid var(--border);
  margin-bottom: 6px;
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 0;
  background: none;
  border-radius: var(--r-sm);
  font-weight: 800;
  text-align: left;
}

.menu-item:hover {
  background: var(--surface-2);
}

.menu-item.danger {
  color: var(--danger);
}
</style>
