// Marca a teoria do módulo como lida (XP só na primeira vez).
const THEORY_XP = 15

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string; moduleId?: number; dateKey?: string }>(event)
  const user = await requireUser(body?.email)
  const moduleId = Number(body?.moduleId)
  if (!Number.isInteger(moduleId) || moduleId < 1 || moduleId > 16) {
    throw createError({ statusCode: 400, statusMessage: 'Módulo inválido' })
  }

  const progress = moduleProgress(user, moduleId)
  const firstTime = !progress.theoryRead
  const xpGain = firstTime ? THEORY_XP : 0
  progress.theoryRead = true
  addXp(user, xpGain)
  const streakUp = touchStreak(user, body?.dateKey)

  await saveUser(user)
  return { user, xpGain, streakUp }
})
