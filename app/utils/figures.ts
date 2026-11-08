import type { FigureRef, FigureValue } from '#shared/types'

export interface FigureInfo {
  value: FigureValue
  name: string
  restName: string
  /** Duração em semifusas (semibreve = 64) — facilita somar figuras */
  units: number
  /** Duração em tempos quando a semínima vale 1 tempo */
  beats: number
  flags: number
}

export const FIGURES: FigureInfo[] = [
  { value: 1, name: 'semibreve', restName: 'pausa de semibreve', units: 64, beats: 4, flags: 0 },
  { value: 2, name: 'mínima', restName: 'pausa de mínima', units: 32, beats: 2, flags: 0 },
  { value: 4, name: 'semínima', restName: 'pausa de semínima', units: 16, beats: 1, flags: 0 },
  { value: 8, name: 'colcheia', restName: 'pausa de colcheia', units: 8, beats: 0.5, flags: 1 },
  { value: 16, name: 'semicolcheia', restName: 'pausa de semicolcheia', units: 4, beats: 0.25, flags: 2 },
  { value: 32, name: 'fusa', restName: 'pausa de fusa', units: 2, beats: 0.125, flags: 3 },
  { value: 64, name: 'semifusa', restName: 'pausa de semifusa', units: 1, beats: 0.0625, flags: 4 },
]

export function figureInfo(value: FigureValue): FigureInfo {
  return FIGURES.find((f) => f.value === value)!
}

export function figureLabel(ref: FigureRef) {
  const f = figureInfo(ref.value)
  return ref.kind === 'note' ? f.name : f.restName
}

/** Glifos (fonte Noto Music) das pausas que não são simples retângulos */
export const REST_GLYPH: Partial<Record<FigureValue, string>> = {
  4: '\u{1D13D}',
  8: '\u{1D13E}',
  16: '\u{1D13F}',
  32: '\u{1D140}',
  64: '\u{1D141}',
}

export function unitsToValue(units: number): FigureValue | null {
  return FIGURES.find((f) => f.units === units)?.value ?? null
}

/** Caminho SVG de uma bandeirola presa à haste em (sx, fy). dir = 1 para haste para cima, -1 para baixo */
export function flagPath(sx: number, fy: number, dir: 1 | -1) {
  const y = (d: number) => fy + d * dir
  return `M ${sx} ${y(0)} C ${sx + 1} ${y(6)} ${sx + 10.5} ${y(9)} ${sx + 9.5} ${y(17)} C ${sx + 9.3} ${y(20)} ${sx + 8.3} ${y(22)} ${sx + 6.8} ${y(24)} C ${sx + 8} ${y(17.5)} ${sx + 4.5} ${y(11.5)} ${sx} ${y(5)} Z`
}
