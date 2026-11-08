import { GAME_MAX_SCORE, GAME_MODES, gameKey, gameXp, type GameId } from '#shared/utils/games'

// Salva o resultado de uma partida da área "Ensaio".
export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string; game?: string; mode?: string; score?: number; dateKey?: string }>(event)
  const game = body?.game as GameId
  const mode = String(body?.mode ?? '')
  if (!(game in GAME_MODES) || !GAME_MODES[game].includes(mode)) {
    throw createError({ statusCode: 400, statusMessage: 'Jogo inválido' })
  }
  const score = Math.max(0, Math.min(GAME_MAX_SCORE[game], Math.floor(Number(body?.score) || 0)))

  const user = await requireUser(body?.email)
  const key = gameKey(game, mode)
  user.games ??= {}
  const stat = (user.games[key] ??= { best: 0, plays: 0 })
  const prevBest = stat.best
  stat.best = Math.max(prevBest, score)
  stat.plays += 1
  stat.lastPlayedAt = new Date().toISOString()

  const xpGain = gameXp(game, score)
  addXp(user, xpGain)
  const streakUp = xpGain > 0 ? touchStreak(user, body?.dateKey) : false

  await saveUser(user)
  return { user, score, xpGain, prevBest, newBest: score > prevBest && prevBest > 0, streakUp }
})
