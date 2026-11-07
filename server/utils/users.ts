import type { ModuleProgress, UserDoc } from '#shared/types'
import { isDateKey, shiftDateKey, toDateKey } from '#shared/utils/dates'

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
  const user = await findUser(email)
  if (!user) throw createError({ statusCode: 404, statusMessage: 'Usuário não encontrado' })
  return user
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

export function displayName(email: string): string {
  const base = email.split('@')[0] ?? email
  return base
    .replace(/[._-]+/g, ' ')
    .replace(/\d+/g, '')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase()) || base
}
