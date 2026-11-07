import type { Clef } from '#shared/types'

export const NOTE_NAMES = ['Dó', 'Ré', 'Mi', 'Fá', 'Sol', 'Lá', 'Si'] as const

/** Índice diatônico absoluto (Dó4 = 28) da 1ª linha de cada clave */
const CLEF_BOTTOM_LINE: Record<Clef, number> = {
  treble: 30, // Mi4
  alto: 24, // Fá3
  bass: 18, // Sol2
}

/** Posição na pauta onde fica a linha de referência de cada clave */
export const CLEF_REFERENCE_POS: Record<Clef, number> = {
  treble: 2, // 2ª linha = Sol
  alto: 4, // 3ª linha = Dó
  bass: 6, // 4ª linha = Fá
}

export const CLEF_GLYPH: Record<Clef, string> = {
  treble: '\u{1D11E}',
  alto: '\u{1D121}',
  bass: '\u{1D122}',
}

export const CLEF_NAME: Record<Clef, string> = {
  treble: 'Clave de sol',
  alto: 'Clave de dó',
  bass: 'Clave de fá',
}

export function diatonicAt(clef: Clef, pos: number) {
  return CLEF_BOTTOM_LINE[clef] + pos
}

export function noteNameOf(diatonic: number) {
  return NOTE_NAMES[((diatonic % 7) + 7) % 7]!
}

const SEMITONES = [0, 2, 4, 5, 7, 9, 11]

export function diatonicToMidi(diatonic: number) {
  const octave = Math.floor(diatonic / 7)
  const step = ((diatonic % 7) + 7) % 7
  return 12 * (octave + 1) + SEMITONES[step]!
}

export function midiToFreq(midi: number) {
  return 440 * 2 ** ((midi - 69) / 12)
}

/** Dó4 + n graus da escala de Dó maior */
export function cMajorMidi(degree: number) {
  return diatonicToMidi(28 + degree)
}

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}
