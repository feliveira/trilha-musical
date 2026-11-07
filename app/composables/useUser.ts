import type { ModuleProgress, UserDoc } from '#shared/types'
import { effectiveStreak, toDateKey } from '#shared/utils/dates'
import { modules, PASS_SCORE } from '~/data/modules'

const STORAGE_KEY = 'trilha:email'

export type NodeStatus = 'done' | 'current' | 'open' | 'locked' | 'soon'

export interface LessonResultData {
  score: number
  xpGain: number
  perfect: boolean
  prevBest: number
  newBest: boolean
  streakUp: boolean
}

function readSavedEmail() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function starsFor(score: number) {
  if (score >= 100) return 3
  if (score >= 80) return 2
  if (score >= PASS_SCORE) return 1
  return 0
}

export function useUser() {
  const user = useState<UserDoc | null>('user', () => null)
  const ready = useState('user-ready', () => false)

  async function login(email: string) {
    const u = await $fetch<UserDoc>('/api/auth', { method: 'POST', body: { email } })
    user.value = u
    try {
      localStorage.setItem(STORAGE_KEY, u.email)
    } catch {}
    return u
  }

  async function init() {
    if (ready.value) return
    const saved = readSavedEmail()
    if (saved) {
      try {
        await login(saved)
      } catch (e) {
        console.error('Falha ao carregar usuário salvo', e)
      }
    }
    ready.value = true
  }

  function logout() {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
    user.value = null
    navigateTo('/')
  }

  const streak = computed(() =>
    user.value ? effectiveStreak(user.value.streak, user.value.lastActiveDate, toDateKey()) : 0,
  )
  const activeToday = computed(() => user.value?.lastActiveDate === toDateKey())

  function progressOf(id: number): ModuleProgress {
    return user.value?.modules[String(id)] ?? { bestScore: 0, attempts: 0, theoryRead: false }
  }

  const trail = computed(() => {
    let currentAssigned = false
    return modules.map((m, i) => {
      const p = progressOf(m.id)
      const prev = i > 0 ? modules[i - 1]! : null
      const unlocked = !prev || (prev.available && progressOf(prev.id).bestScore >= PASS_SCORE)
      let status: NodeStatus
      if (!m.available) status = 'soon'
      else if (!unlocked) status = 'locked'
      else if (p.bestScore >= PASS_SCORE) status = 'done'
      else if (!currentAssigned) status = 'current'
      else status = 'open'
      if (status === 'current') currentAssigned = true
      return { module: m, progress: p, status, stars: starsFor(p.bestScore) }
    })
  })

  const currentNode = computed(
    () =>
      trail.value.find((n) => n.status === 'current') ??
      [...trail.value].reverse().find((n) => n.status === 'done') ??
      trail.value[0]!,
  )

  async function submitLesson(moduleId: number, correct: number, total: number): Promise<LessonResultData> {
    const res = await $fetch<LessonResultData & { user: UserDoc }>('/api/progress', {
      method: 'POST',
      body: { email: user.value?.email, moduleId, correct, total, dateKey: toDateKey() },
    })
    user.value = res.user
    return res
  }

  async function markTheoryRead(moduleId: number) {
    const res = await $fetch<{ user: UserDoc; xpGain: number; streakUp: boolean }>('/api/theory', {
      method: 'POST',
      body: { email: user.value?.email, moduleId, dateKey: toDateKey() },
    })
    user.value = res.user
    return res
  }

  return {
    user,
    ready,
    login,
    init,
    logout,
    streak,
    activeToday,
    progressOf,
    trail,
    currentNode,
    submitLesson,
    markTheoryRead,
  }
}
