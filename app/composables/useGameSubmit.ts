// Estado comum do fim de partida dos jogos do Ensaio.
export interface GameOutcome {
  score: number
  xpGain: number
  newBest: boolean
  best: number
  streakUp: boolean
  saved: boolean
}

export function useGameSubmit(game: string, mode: Ref<string> | string) {
  const { submitGame, gameBest } = useUser()
  const outcome = ref<GameOutcome | null>(null)
  const saving = ref(false)

  async function finish(score: number) {
    const m = unref(mode)
    saving.value = true
    try {
      const res = await submitGame(game, m, score)
      outcome.value = {
        score,
        xpGain: res.xpGain,
        newBest: res.newBest,
        best: gameBest(game, m),
        streakUp: res.streakUp,
        saved: true,
      }
    } catch (e) {
      console.error(e)
      outcome.value = { score, xpGain: 0, newBest: false, best: Math.max(score, gameBest(game, m)), streakUp: false, saved: false }
    } finally {
      saving.value = false
    }
  }

  function reset() {
    outcome.value = null
  }

  return { outcome, saving, finish, reset }
}
