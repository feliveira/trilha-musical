<script setup lang="ts">
import { Flame, Zap, Trophy } from 'lucide-vue-next'
import type { RankingEntry } from '#shared/types'
import { toDateKey } from '#shared/utils/dates'

const { user } = useUser()
const { data, pending, error } = await useFetch<{ entries: RankingEntry[]; myPosition: number | null }>('/api/ranking', {
  query: { email: user.value?.email, dateKey: toDateKey() },
  server: false,
})

const MEDALS = ['var(--gold-fill)', '#d9dfe8', '#f2d2b6']
</script>

<template>
  <div class="page">
    <header class="head">
      <div class="head-icon"><Trophy :size="40" :stroke-width="2.2" /></div>
      <h1>Ranking</h1>
      <p class="muted">Ganhe XP lendo a teoria e fazendo exercícios para subir de posição.</p>
      <p v-if="data?.myPosition" class="me-pos">Você está em <strong>{{ data.myPosition }}º lugar</strong></p>
    </header>

    <div v-if="pending" class="list">
      <div v-for="i in 5" :key="i" class="row skeleton" />
    </div>
    <p v-else-if="error" class="muted center">Não foi possível carregar o ranking.</p>
    <ol v-else class="list">
      <li v-for="(e, i) in data?.entries" :key="i" class="row" :class="{ me: e.isMe }">
        <span class="pos" :style="i < 3 ? { background: MEDALS[i], color: 'var(--text)' } : undefined">{{ i + 1 }}</span>
        <span class="avatar round">{{ e.name[0]?.toUpperCase() }}</span>
        <span class="name">{{ e.name }}<small v-if="e.isMe"> (você)</small></span>
        <span v-if="e.streak" class="streak"><Flame :size="16" fill="currentColor" />{{ e.streak }}</span>
        <span class="xp"><Zap :size="16" fill="currentColor" />{{ e.xp }}</span>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.page {
  max-width: 600px;
  margin: 0 auto;
}

.head {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
}

.head-icon {
  width: 84px;
  height: 84px;
  display: grid;
  place-items: center;
  border-radius: var(--r-lg);
  background: var(--gold-fill);
  color: var(--on-gold);
  box-shadow: 0 5px 0 var(--gold-shadow);
  margin-bottom: 8px;
}

h1 {
  font-size: 28px;
}

.me-pos {
  margin-top: 4px;
  padding: 6px 14px;
  border-radius: var(--r-sm);
  background: var(--primary-soft);
  color: var(--primary);
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border: 2px solid var(--border);
  border-radius: var(--r-md);
  background: var(--surface);
  min-height: 64px;
}

.row.me {
  border-color: var(--primary);
  background: var(--primary-soft);
}

.skeleton {
  background: var(--surface-2);
  border-color: transparent;
  animation: pulse-bg 1.2s ease-in-out infinite alternate;
}

@keyframes pulse-bg {
  to {
    opacity: 0.5;
  }
}

.pos {
  flex: none;
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: var(--r-xs);
  font-weight: 900;
  color: var(--muted);
}

.avatar {
  flex: none;
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--surface-2);
  color: var(--primary);
  font-weight: 900;
}

.row.me .avatar {
  background: var(--surface);
}

.name {
  flex: 1;
  min-width: 0;
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.name small {
  color: var(--primary);
  font-weight: 800;
}

.streak,
.xp {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 900;
}

.streak {
  color: var(--flame-dark);
}

.xp {
  color: var(--gold-dark);
  min-width: 64px;
  justify-content: flex-end;
}

.center {
  text-align: center;
}
</style>
