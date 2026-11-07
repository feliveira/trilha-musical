<script setup lang="ts">
import { Mail, ArrowRight } from 'lucide-vue-next'

const { login } = useUser()
const email = ref('')
const loading = ref(false)
const error = ref('')
const shake = ref(false)

const valid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))

async function submit() {
  if (!valid.value) {
    error.value = 'Digite um e-mail válido.'
    shake.value = false
    requestAnimationFrame(() => (shake.value = true))
    return
  }
  loading.value = true
  error.value = ''
  try {
    await login(email.value.trim())
  } catch {
    error.value = 'Não foi possível entrar agora. Tente de novo.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="overlay">
    <form class="modal pop-in" :class="{ shake }" @submit.prevent="submit" @animationend="shake = false">
      <div class="logo">
        <span class="music">&#x1D11E;</span>
      </div>
      <h1>Trilha Musical</h1>
      <p class="muted lead">Aprenda teoria musical um passo de cada vez. Entre com seu e-mail para continuar de onde parou.</p>

      <label class="field" :class="{ invalid: !!error }">
        <Mail :size="20" />
        <input
          v-model="email"
          type="email"
          inputmode="email"
          autocomplete="email"
          placeholder="seu@email.com"
          autofocus
          @input="error = ''"
        >
      </label>
      <p v-if="error" class="error">{{ error }}</p>

      <button class="btn btn-block" type="submit" :disabled="loading">
        {{ loading ? 'Entrando…' : 'Começar' }}
        <ArrowRight v-if="!loading" :size="20" :stroke-width="3" />
      </button>
    </form>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 16px;
  background: var(--bg);
}

@media (min-width: 640px) {
  .overlay {
    background: var(--backdrop);
  }
}

.modal {
  width: 100%;
  max-width: 420px;
  background: var(--surface);
  border-radius: var(--r-xl);
  padding: 32px 24px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

@media (min-width: 640px) {
  .modal {
    border: 2px solid var(--border);
    padding: 40px 32px 28px;
  }
}

.logo {
  width: 88px;
  height: 88px;
  margin: 0 auto 6px;
  display: grid;
  place-items: center;
  background: var(--primary-fill);
  color: var(--on-primary);
  border-radius: var(--r-lg);
  box-shadow: 0 6px 0 var(--primary-shadow);
  font-size: 54px;
  line-height: 1;
}

.logo span {
  transform: translateY(4px);
}

h1 {
  font-size: 28px;
}

.lead {
  font-size: 15px;
  margin-bottom: 8px;
}

.field {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  min-height: 56px;
  border: 2px solid var(--border);
  background: var(--surface-2);
  border-radius: var(--r-md);
  color: var(--muted);
  transition: border-color 0.15s;
}

.field:focus-within {
  border-color: var(--primary);
  color: var(--primary);
}

.field.invalid {
  border-color: var(--danger);
  color: var(--danger);
}

.field input {
  flex: 1;
  min-width: 0;
  border: 0;
  background: transparent;
  outline: none;
  font-size: 17px;
  font-weight: 700;
  color: var(--text);
}

.error {
  color: var(--danger);
  font-size: 14px;
  font-weight: 800;
  margin-top: -6px;
  text-align: left;
}
</style>
