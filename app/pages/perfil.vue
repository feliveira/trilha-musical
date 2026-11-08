<script setup lang="ts">
import { Flame, Zap, Star, BookOpen, LogOut, Volume2, VolumeX, Crown, Gamepad2, Pencil, Check, X } from 'lucide-vue-next'
import { TOTAL_MODULES } from '~/data/modules'

const { user, streak, trail, logout, profileName, updateName } = useUser()

const editing = ref(false)
const draft = ref('')
const nameError = ref('')
const savingName = ref(false)
const nameInput = ref<HTMLInputElement | null>(null)

function startEdit() {
  draft.value = profileName.value
  nameError.value = ''
  editing.value = true
  nextTick(() => nameInput.value?.select())
}

async function saveName() {
  const name = draft.value.replace(/\s+/g, ' ').trim()
  if (name.length < 2 || name.length > 30) {
    nameError.value = 'Use entre 2 e 30 caracteres.'
    return
  }
  savingName.value = true
  try {
    await updateName(name)
    editing.value = false
  } catch {
    nameError.value = 'Não foi possível salvar. Tente de novo.'
  } finally {
    savingName.value = false
  }
}
const { muted, toggleMute } = useAudio()

const doneCount = computed(() => trail.value.filter((n) => n.status === 'done').length)
const totalStars = computed(() => trail.value.reduce((s, n) => s + n.stars, 0))
const since = computed(() =>
  user.value ? new Date(user.value.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : '',
)
const gamesPlayed = computed(() => Object.values(user.value?.games ?? {}).reduce((s, g) => s + g.plays, 0))
const played = computed(() => trail.value.filter((n) => n.progress.attempts > 0 || n.progress.theoryRead))
</script>

<template>
  <div v-if="user" class="page">
    <header class="head">
      <div class="avatar">{{ profileName[0]?.toUpperCase() }}</div>
      <div class="who">
        <form v-if="editing" class="name-edit" @submit.prevent="saveName">
          <input
            ref="nameInput"
            v-model="draft"
            maxlength="30"
            aria-label="Seu nome"
            placeholder="Como quer ser chamado?"
            @keydown.esc="editing = false"
          >
          <button class="icon-btn ok" type="submit" :disabled="savingName" aria-label="Salvar nome"><Check :size="20" :stroke-width="3" /></button>
          <button class="icon-btn" type="button" aria-label="Cancelar" @click="editing = false"><X :size="20" :stroke-width="3" /></button>
        </form>
        <div v-else class="name-row">
          <h1>{{ profileName }}</h1>
          <button class="icon-btn edit" aria-label="Editar nome" title="Editar nome" @click="startEdit"><Pencil :size="18" /></button>
        </div>
        <p v-if="nameError" class="name-error">{{ nameError }}</p>
        <p v-else-if="editing" class="muted small">Este nome aparece no ranking.</p>
        <p class="muted">{{ user.email }}</p>
        <p class="muted small">Aprendendo desde {{ since }}</p>
      </div>
    </header>

    <h2>Estatísticas</h2>
    <div class="stats">
      <div class="stat">
        <Flame :size="26" class="c-flame" fill="currentColor" />
        <div>
          <p class="v">{{ streak }}</p>
          <p class="l">Ofensiva atual</p>
        </div>
      </div>
      <div class="stat">
        <Flame :size="26" class="c-muted" />
        <div>
          <p class="v">{{ user.bestStreak }}</p>
          <p class="l">Maior ofensiva</p>
        </div>
      </div>
      <div class="stat">
        <Zap :size="26" class="c-gold" fill="currentColor" />
        <div>
          <p class="v">{{ user.xp }}</p>
          <p class="l">Total de XP</p>
        </div>
      </div>
      <div class="stat">
        <Star :size="26" class="c-gold" fill="currentColor" />
        <div>
          <p class="v">{{ totalStars }}</p>
          <p class="l">Estrelas</p>
        </div>
      </div>
      <div class="stat">
        <Crown :size="26" class="c-gold" />
        <div>
          <p class="v">{{ user.weeklyWins ?? 0 }}</p>
          <p class="l">{{ (user.weeklyWins ?? 0) === 1 ? 'Vitória' : 'Vitórias' }} no ranking</p>
        </div>
      </div>
      <div class="stat">
        <Gamepad2 :size="26" class="c-blue" />
        <div>
          <p class="v">{{ gamesPlayed }}</p>
          <p class="l">Partidas no Ensaio</p>
        </div>
      </div>
    </div>

    <h2>Módulos <span class="muted">{{ doneCount }}/{{ TOTAL_MODULES }}</span></h2>
    <div v-if="played.length" class="mods">
      <NuxtLink v-for="n in played" :key="n.module.id" to="/" class="mod">
        <span class="num" :class="n.status">{{ n.module.id }}</span>
        <span class="mod-info">
          <strong>{{ n.module.title }}</strong>
          <small class="muted">
            Maior nota: {{ n.progress.attempts ? `${n.progress.bestScore}%` : '—' }}
            <template v-if="n.progress.theoryRead"> · <BookOpen :size="12" /> teoria lida</template>
          </small>
        </span>
        <StarRow :count="n.stars" :size="16" />
      </NuxtLink>
    </div>
    <p v-else class="muted empty">Você ainda não começou nenhum módulo. Que tal começar agora?</p>

    <div class="actions">
      <button class="btn btn-ghost btn-block" @click="toggleMute">
        <component :is="muted ? VolumeX : Volume2" :size="20" />
        {{ muted ? 'Ativar efeitos sonoros' : 'Silenciar efeitos sonoros' }}
      </button>
      <button class="btn btn-ghost btn-block logout" @click="logout"><LogOut :size="20" /> Sair</button>
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.head {
  display: flex;
  align-items: center;
  gap: 18px;
  padding-bottom: 20px;
  border-bottom: 2px solid var(--border);
}

.avatar {
  flex: none;
  width: 84px;
  height: 84px;
  display: grid;
  place-items: center;
  border-radius: var(--r-lg);
  background: var(--primary-fill);
  color: var(--on-primary);
  font-size: 38px;
  font-weight: 900;
  box-shadow: 0 5px 0 var(--primary-shadow);
}

.who {
  min-width: 0;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.edit {
  flex: none;
  width: 36px;
  height: 36px;
}

.name-edit {
  display: flex;
  align-items: center;
  gap: 4px;
}

.name-edit input {
  flex: 1;
  min-width: 0;
  height: 44px;
  padding: 0 12px;
  border: 2px solid var(--primary);
  border-radius: var(--r-sm);
  background: var(--surface);
  font-size: 18px;
  font-weight: 800;
  outline: none;
}

.icon-btn.ok {
  color: var(--success-dark);
}

.name-error {
  color: var(--danger);
  font-size: 13px;
  font-weight: 800;
}

.who {
  flex: 1;
}

.who h1 {
  font-size: 24px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.who p {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.small {
  font-size: 13px;
}

h2 {
  font-size: 20px;
  margin-top: 8px;
}

.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: var(--r-md);
}

.v {
  font-size: 20px;
  font-weight: 900;
  line-height: 1.1;
}

.l {
  font-size: 13px;
  color: var(--muted);
}

.c-flame {
  color: var(--flame);
}

.c-gold {
  color: var(--gold);
}

.c-blue {
  color: var(--primary);
}

.c-muted {
  color: var(--faint);
}

.mods {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mod {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: var(--r-md);
}

.num {
  flex: none;
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: var(--r-sm);
  background: var(--primary-fill);
  color: var(--on-primary);
  font-weight: 900;
}

.num.done {
  background: var(--gold-fill);
  color: var(--on-gold);
}

.mod-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.mod-info small {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  flex-wrap: wrap;
}

.empty {
  padding: 16px;
  border: 2px dashed var(--border);
  border-radius: var(--r-md);
  text-align: center;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.logout {
  --c-text: var(--danger);
}
</style>
