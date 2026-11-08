<script setup lang="ts">
import { Zap, Plus, Link2, Play, Trophy } from 'lucide-vue-next'
import { GAMES } from '~/data/games'
import { gameXp, GAME_MAX_SCORE } from '#shared/utils/games'

const { gameBest } = useUser()
const ICONS = { leitura: Zap, soma: Plus, pares: Link2 }
const COLORS = { leitura: 'var(--fam-3)', soma: 'var(--fam-5)', pares: 'var(--fam-7)' }

const modes = reactive<Record<string, string>>(Object.fromEntries(GAMES.map((g) => [g.id, g.modes[0]!.id])))
</script>

<template>
  <div class="page">
    <header class="head">
      <h1>Ensaio</h1>
      <p class="muted">Jogos rápidos para treinar o que você aprendeu. Cada partida vale XP para o ranking da semana!</p>
    </header>

    <div class="games">
      <article v-for="g in GAMES" :key="g.id" class="game" :style="{ '--c': COLORS[g.id] }">
        <div class="top">
          <span class="icon"><component :is="ICONS[g.id]" :size="28" :stroke-width="2.6" /></span>
          <div class="info">
            <h2>{{ g.title }}</h2>
            <p class="muted">{{ g.tagline }}</p>
          </div>
        </div>

        <div class="modes" role="radiogroup" :aria-label="`Modo de ${g.title}`">
          <button
            v-for="m in g.modes"
            :key="m.id"
            role="radio"
            :aria-checked="modes[g.id] === m.id"
            :class="{ on: modes[g.id] === m.id }"
            @click="modes[g.id] = m.id"
          >
            {{ m.label }}
          </button>
        </div>

        <div class="bottom">
          <div class="stats">
            <span class="best"><Trophy :size="16" /> Recorde: <strong>{{ gameBest(g.id, modes[g.id]!) }}</strong> {{ g.scoreLabel }}</span>
            <span class="xp">até {{ gameXp(g.id, GAME_MAX_SCORE[g.id]) }} XP</span>
          </div>
          <NuxtLink :to="`/ensaio/${g.id}?modo=${modes[g.id]}`" class="btn play"><Play :size="18" fill="currentColor" /> Jogar</NuxtLink>
        </div>
        <p class="rec">Recomendado após o {{ g.recommended }}</p>
      </article>
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: 640px;
  margin: 0 auto;
}

.head {
  margin-bottom: 20px;
}

.head h1 {
  font-size: 30px;
}

.games {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.game {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: var(--r-lg);
  box-shadow: 0 4px 0 var(--border);
}

.top {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.icon {
  flex: none;
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  border-radius: var(--r-md);
  background: var(--c);
  color: var(--on-primary);
  box-shadow: 0 4px 0 color-mix(in srgb, var(--on-primary) 25%, var(--c));
}

.info h2 {
  font-size: 20px;
}

.info p {
  font-size: 14px;
  margin-top: 2px;
}

.modes {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.modes button {
  padding: 7px 12px;
  border: 2px solid var(--border);
  background: var(--surface);
  border-radius: var(--r-sm);
  font-weight: 800;
  font-size: 13px;
  color: var(--muted);
}

.modes button.on {
  border-color: var(--primary);
  background: var(--primary-soft);
  color: var(--primary-dark);
}

.bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 13px;
}

.best {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--gold-dark);
  font-weight: 800;
}

.xp {
  color: var(--muted);
  font-weight: 700;
}

.play {
  min-height: 48px;
  padding: 10px 20px;
}

.rec {
  font-size: 12px;
  color: var(--faint);
  font-weight: 700;
  margin-top: -6px;
}
</style>
