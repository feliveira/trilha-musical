import type { GameId } from '#shared/utils/games'

export interface GameMeta {
  id: GameId
  title: string
  tagline: string
  recommended: string
  scoreLabel: string
  modes: { id: string; label: string }[]
}

export const GAMES: GameMeta[] = [
  {
    id: 'leitura',
    title: 'Leitura relâmpago',
    tagline: 'Quantas notas você consegue ler na pauta em 60 segundos?',
    recommended: 'Módulo 1',
    scoreLabel: 'notas',
    modes: [
      { id: 'sol', label: 'Clave de sol' },
      { id: 'fa', label: 'Clave de fá' },
      { id: 'do', label: 'Clave de dó' },
    ],
  },
  {
    id: 'soma',
    title: 'Soma de figuras',
    tagline: 'Junte as figuras e descubra qual figura única vale o mesmo.',
    recommended: 'Módulo 2',
    scoreLabel: 'acertos',
    modes: [
      { id: 'som', label: 'Figuras de som' },
      { id: 'silencio', label: 'Figuras de silêncio' },
    ],
  },
  {
    id: 'pares',
    title: 'Pares de figuras',
    tagline: 'Ligue cada figura de som ao seu par o mais rápido que puder.',
    recommended: 'Módulo 2',
    scoreLabel: 'pares de primeira',
    modes: [
      { id: 'nome', label: 'Nome' },
      { id: 'pausa', label: 'Figura de silêncio' },
      { id: 'numero', label: 'Nº de equivalência' },
    ],
  },
]

export function gameMeta(id: GameId) {
  return GAMES.find((g) => g.id === id)!
}
