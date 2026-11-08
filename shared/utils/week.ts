// Semanas do ranking: de segunda 00:00 a domingo 23:59, horário de Brasília.

const TZ = 'America/Sao_Paulo'

/** Data YYYY-MM-DD no horário de Brasília */
export function brDateKey(d: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
}

/** Semana ISO de uma data YYYY-MM-DD, ex.: "2026-W45" */
export function isoWeekKey(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  const date = new Date(Date.UTC(y!, m! - 1, d!))
  const day = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - day)
  const yearStart = Date.UTC(date.getUTCFullYear(), 0, 1)
  const week = Math.ceil(((date.getTime() - yearStart) / 86400000 + 1) / 7)
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

export function currentWeekKey(now: Date = new Date()): string {
  return isoWeekKey(brDateKey(now))
}

/** Próxima segunda-feira 00:00 (Brasília, UTC-3), em ISO */
export function weekEndsAt(now: Date = new Date()): string {
  const [y, m, d] = brDateKey(now).split('-').map(Number)
  const weekday = new Date(Date.UTC(y!, m! - 1, d!)).getUTCDay() // 0 = domingo
  const daysToMonday = ((8 - weekday) % 7) || 7
  return new Date(Date.UTC(y!, m! - 1, d! + daysToMonday, 3, 0, 0)).toISOString()
}
