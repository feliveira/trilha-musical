import type { ModuleProgress, UserDoc } from '#shared/types'
import { isDateKey, shiftDateKey, toDateKey } from '#shared/utils/dates'
import { currentWeekKey } from '#shared/utils/week'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeEmail(raw: unknown): string {
  const email = String(raw ?? '').trim().toLowerCase()
  if (!EMAIL_RE.test(email) || email.length > 200) {
    throw createError({ statusCode: 400, statusMessage: 'E-mail inválido' })
  }
  return email
}

export function newUser(email: string): UserDoc {
  const now = new Date().toISOString()
  return {
    email,
    xp: 0,
    streak: 0,
    bestStreak: 0,
    lastActiveDate: null,
    modules: {},
    createdAt: now,
    updatedAt: now,
  }
}

export async function requireUser(rawEmail: unknown): Promise<UserDoc> {
  const email = normalizeEmail(rawEmail)
  // encerra a semana do ranking antes de ler o usuário, para não sobrescrever a vitória
  await ensureCurrentWeek(currentWeekKey())
  const user = await findUser(email)
  if (!user) throw createError({ statusCode: 404, statusMessage: 'Usuário não encontrado' })
  return withCurrentWeek(user)
}

/** Zera o XP semanal exibido se o usuário ainda não pontuou nesta semana */
export function withCurrentWeek(user: UserDoc): UserDoc {
  const week = currentWeekKey()
  if (user.weekKey !== week) {
    user.weekKey = week
    user.weeklyXp = 0
  }
  return user
}

/** Soma XP no total e no ranking da semana */
export function addXp(user: UserDoc, amount: number) {
  withCurrentWeek(user)
  user.xp += amount
  user.weeklyXp = (user.weeklyXp ?? 0) + amount
}

export function moduleProgress(user: UserDoc, moduleId: number): ModuleProgress {
  const key = String(moduleId)
  user.modules[key] ??= { bestScore: 0, attempts: 0, theoryRead: false }
  return user.modules[key]
}

/** Registra atividade do dia e atualiza a ofensiva. Retorna true se a ofensiva aumentou hoje. */
export function touchStreak(user: UserDoc, rawDateKey: unknown): boolean {
  const today = isDateKey(rawDateKey) ? rawDateKey : toDateKey()
  if (user.lastActiveDate === today) return false
  const continued = user.lastActiveDate === shiftDateKey(today, -1)
  user.streak = continued ? user.streak + 1 : 1
  user.bestStreak = Math.max(user.bestStreak, user.streak)
  user.lastActiveDate = today
  return true
}

/** Nome público do usuário: o nome escolhido no perfil ou, se não houver, derivado do e-mail */
export function publicName(user: Pick<UserDoc, 'email' | 'name'>): string {
  return user.name?.trim() || displayName(user.email)
}

/** Limpa e valida o nome digitado no perfil */
export function normalizeName(raw: unknown): string {
  const name = String(raw ?? '').replace(/\s+/g, ' ').trim()
  if (name.length < 2 || name.length > 30) {
    throw createError({ statusCode: 400, statusMessage: 'O nome deve ter entre 2 e 30 caracteres' })
  }
  return name
}

export function displayName(email: string): string {
  const base = email.split('@')[0] ?? email
  return base
    .replace(/[._-]+/g, ' ')
    .replace(/\d+/g, '')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase()) || base
}
