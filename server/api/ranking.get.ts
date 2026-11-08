import type { RankingResponse } from '#shared/types'
import { effectiveStreak, isDateKey, toDateKey } from '#shared/utils/dates'
import { currentWeekKey, weekEndsAt } from '#shared/utils/week'

// Ranking semanal: soma do XP ganho desde segunda-feira (horário de Brasília).
export default defineEventHandler(async (event): Promise<RankingResponse> => {
  const query = getQuery(event)
  const me = query.email ? String(query.email).trim().toLowerCase() : null
  const today = isDateKey(query.dateKey) ? query.dateKey : toDateKey()
  const week = currentWeekKey()
  await ensureCurrentWeek(week)

  const top = await topWeekly(week, 30)
  const entries = top.map((u) => ({
    name: publicName(u),
    xp: u.weeklyXp ?? 0,
    streak: effectiveStreak(u.streak, u.lastActiveDate, today),
    wins: u.weeklyWins ?? 0,
    isMe: u.email === me,
  }))

  let myPosition: number | null = null
  let myWeeklyXp = 0
  if (me) {
    const user = await findUser(me)
    myWeeklyXp = user && user.weekKey === week ? (user.weeklyXp ?? 0) : 0
    if (myWeeklyXp > 0) {
      const idx = top.findIndex((u) => u.email === me)
      myPosition = idx >= 0 ? idx + 1 : (await countWeeklyAbove(week, myWeeklyXp)) + 1
    }
  }

  return { week, endsAt: weekEndsAt(), entries, myPosition, myWeeklyXp, lastWinners: await getLastWinners() }
})
