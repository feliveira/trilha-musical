import type { RankingEntry } from '#shared/types'
import { effectiveStreak, isDateKey, toDateKey } from '#shared/utils/dates'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const me = query.email ? String(query.email).trim().toLowerCase() : null
  const today = isDateKey(query.dateKey) ? query.dateKey : toDateKey()

  const top = await topUsers(20)
  const entries: RankingEntry[] = top.map((u) => ({
    name: displayName(u.email),
    xp: u.xp,
    streak: effectiveStreak(u.streak, u.lastActiveDate, today),
    isMe: u.email === me,
  }))

  let myPosition: number | null = null
  if (me) {
    const idx = top.findIndex((u) => u.email === me)
    if (idx >= 0) myPosition = idx + 1
    else {
      const user = await findUser(me)
      if (user) myPosition = (await countUsersAbove(user.xp)) + 1
    }
  }

  return { entries, myPosition }
})
