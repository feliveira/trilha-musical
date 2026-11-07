/** Data local no formato YYYY-MM-DD */
export function toDateKey(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Soma (ou subtrai) dias de uma data YYYY-MM-DD */
export function shiftDateKey(key: string, days: number): string {
  const [y, m, d] = key.split('-').map(Number)
  const date = new Date(y!, m! - 1, d!)
  date.setDate(date.getDate() + days)
  return toDateKey(date)
}

export function isDateKey(v: unknown): v is string {
  return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)
}

/** Ofensiva "viva": última atividade hoje ou ontem */
export function effectiveStreak(streak: number, lastActiveDate: string | null, today: string): number {
  if (!lastActiveDate) return 0
  if (lastActiveDate === today || lastActiveDate === shiftDateKey(today, -1)) return streak
  return 0
}
