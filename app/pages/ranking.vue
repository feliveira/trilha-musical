<script setup lang="ts">
import { Flame, Zap, Trophy, Clock, Crown } from 'lucide-vue-next'
import type { RankingResponse } from '#shared/types'
import { toDateKey } from '#shared/utils/dates'

const { user } = useUser()
const { data, pending, error } = await useFetch<RankingResponse>('/api/ranking', {
  query: { email: user.value?.email, dateKey: toDateKey() },
  server: false,
})

const MEDALS = ['var(--gold-fill)', '#d9dfe8', '#f2d2b6']

const endsIn = computed(() => {
  if (!data.value) return ''
  const ms = new Date(data.value.endsAt).getTime() - Date.now()
  const h = Math.max(0, Math.floor(ms / 3600000))
  if (h >= 48) return `${Math.floor(h / 24)} dias`
  if (h >= 24) return '1 dia'
  if (h >= 1) return `${h} ${h === 1 ? 'hora' : 'horas'}`
  return 'menos de 1 hora'
})
</script>

<template>
  <div class="page">
    <header class="head">
      <div class="head-icon"><Trophy :size="40" :stroke-width="2.2" /></div>
      <h1>Ranking semanal</h1>
      <p class="muted">Ganhe XP com teoria, exercícios e jogos do Ensaio. Quem terminar a semana em 1º lugar ganha uma vitória no perfil!</p>
      <div class="meta">
        <span v-if="data" class="chip"><Clock :size="16" /> Termina em {{ endsIn }}</span>
        <span v-if="data?.myPosition" class="chip me-pos">Você está em <strong>{{ data.myPosition }}º</strong></span>
        <span v-else-if="data" class="chip">Ganhe XP para entrar no ranking</span>
      </div>
    </header>

    <div v-if="data?.lastWinners.length" class="winners">
      <Crown :size="22" />
      <span>Campeã(o) da semana passada: <strong>{{ data.lastWinners.join(', ') }}</strong></span>
    </div>

    <div v-if="pending" class="list">
      <div v-for="i in 5" :key="i" class="row skeleton" />
    </div>
    <p v-else-if="error" class="muted center">Não foi possível carregar o ranking.</p>
    <div v-else-if="!data?.entries.length" class="empty">
      <p><strong>A semana acabou de começar!</strong></p>
      <p class="muted">Ninguém pontuou ainda. Faça uma lição e saia na frente.</p>
    </div>
    <ol v-else class="list">
      <li v-for="(e, i) in data.entries" :key="i" class="row" :class="{ me: e.isMe }">
        <span class="pos" :style="i < 3 ? { background: MEDALS[i], color: 'var(--text)' } : undefined">{{ i + 1 }}</span>
        <span class="avatar round">{{ e.name[0]?.toUpperCase() }}</span>
        <span class="name">
          {{ e.name }}<small v-if="e.isMe"> (você)</small>
          <span v-if="e.wins" class="wins" :title="`${e.wins} vitórias semanais`"><Crown :size="13" />{{ e.wins }}</span>
        </span>
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

.meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 4px;
}

.chip {
  background: var(--surface);
  border: 2px solid var(--border);
  color: var(--muted);
}

.me-pos {
  background: var(--primary-soft);
  border-color: transparent;
  color: var(--primary-dark);
}

.winners {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  margin-bottom: 16px;
  border-radius: var(--r-md);
  background: var(--gold-soft);
  color: var(--on-gold);
}

.winners svg {
  flex: none;
  color: var(--gold-dark);
}

.empty {
  text-align: center;
  padding: 28px 16px;
  border: 2px dashed var(--border-strong);
  border-radius: var(--r-lg);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.wins {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  margin-left: 6px;
  padding: 1px 6px;
  border-radius: var(--r-xs);
  background: var(--gold-soft);
  color: var(--gold-dark);
  font-size: 12px;
  vertical-align: middle;
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
