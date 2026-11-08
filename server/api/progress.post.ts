// Salva o resultado de uma sessão de exercícios.
const XP_PER_CORRECT = 10
const PERFECT_BONUS = 20

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    email?: string
    moduleId?: number
    correct?: number
    total?: number
    dateKey?: string
  }>(event)

  const user = await requireUser(body?.email)
  const moduleId = Number(body?.moduleId)
  const total = Math.max(1, Math.min(100, Math.floor(Number(body?.total) || 0)))
  const correct = Math.max(0, Math.min(total, Math.floor(Number(body?.correct) || 0)))
  if (!Number.isInteger(moduleId) || moduleId < 1 || moduleId > 16) {
    throw createError({ statusCode: 400, statusMessage: 'Módulo inválido' })
  }

  const score = Math.round((correct / total) * 100)
  const perfect = correct === total
  const xpGain = correct * XP_PER_CORRECT + (perfect ? PERFECT_BONUS : 0)

  const progress = moduleProgress(user, moduleId)
  const prevBest = progress.bestScore
  progress.bestScore = Math.max(prevBest, score)
  progress.attempts += 1
  progress.lastPlayedAt = new Date().toISOString()

  addXp(user, xpGain)
  const streakUp = touchStreak(user, body?.dateKey)

  await saveUser(user)

  return {
    user,
    score,
    xpGain,
    perfect,
    prevBest,
    newBest: score > prevBest,
    streakUp,
  }
})
