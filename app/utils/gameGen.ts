import type { FigureValue } from '#shared/types'

export interface SomaRound {
  parts: FigureValue[]
  answer: FigureValue
  options: FigureValue[]
}

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]!

/** Gera figuras que, somadas, equivalem a uma única figura (ex.: colcheia + colcheia = semínima) */
export function genSomaRound(prev?: SomaRound): SomaRound {
  for (let attempt = 0; attempt < 20; attempt++) {
    const target = pick([64, 32, 32, 16, 16, 16, 8, 8])
    let parts = [target]
    const splits = 1 + Math.floor(Math.random() * 3)
    for (let s = 0; s < splits; s++) {
      const idxs = parts.map((u, i) => (u >= 8 ? i : -1)).filter((i) => i >= 0)
      if (!idxs.length) break
      const i = pick(idxs)
      const half = parts[i]! / 2
      parts.splice(i, 1, half, half)
    }
    parts = shuffle(parts)
    const answer = unitsToValue(target)!
    const values = parts.map((u) => unitsToValue(u)!)
    const key = values.join(',')
    if (prev && prev.parts.join(',') === key) continue

    const near = [target * 2, target / 2, target / 4, target * 4, target / 8]
      .filter((u) => u >= 1 && u <= 64 && Number.isInteger(u))
      .map((u) => unitsToValue(u)!)
      .filter((v) => v !== answer)
    const distractors = shuffle(Array.from(new Set(near))).slice(0, 3)
    return { parts: values, answer, options: shuffle([answer, ...distractors]) }
  }
  return { parts: [8, 8], answer: 4, options: shuffle([4, 2, 8, 1] as FigureValue[]) }
}
