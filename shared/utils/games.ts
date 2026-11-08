// Jogos da área "Ensaio" — definições compartilhadas entre cliente e servidor.

export type GameId = 'leitura' | 'soma' | 'pares'

export const GAME_MODES: Record<GameId, string[]> = {
  leitura: ['sol', 'fa', 'do'],
  soma: ['som', 'silencio'],
  pares: ['nome', 'pausa', 'numero'],
}

/** Duração do desafio de leitura de notas, em segundos */
export const LEITURA_SECONDS = 60
/** Rodadas do jogo de soma de figuras */
export const SOMA_ROUNDS = 10
/** Rodadas × pares do jogo de pares */
export const PARES_ROUNDS = 3
export const PARES_PER_ROUND = 5

/** Pontuação máxima plausível por jogo (validação no servidor) */
export const GAME_MAX_SCORE: Record<GameId, number> = {
  leitura: 120,
  soma: SOMA_ROUNDS,
  pares: PARES_ROUNDS * PARES_PER_ROUND,
}

export function gameXp(game: GameId, score: number): number {
  switch (game) {
    case 'leitura':
      return Math.min(60, score * 2)
    case 'soma':
      return score * 3 + (score === SOMA_ROUNDS ? 10 : 0)
    case 'pares':
      return score * 2 + (score === PARES_ROUNDS * PARES_PER_ROUND ? 10 : 0)
  }
}

export function gameKey(game: GameId, mode: string) {
  return `${game}:${mode}`
}
