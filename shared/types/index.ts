// ---------- Conteúdo ----------

export type Clef = 'treble' | 'alto' | 'bass'

/**
 * Posição na pauta: 0 = 1ª linha, 1 = 1º espaço, 2 = 2ª linha ... 8 = 5ª linha.
 * Valores negativos ficam abaixo da pauta e maiores que 8 acima (linhas suplementares).
 */
export interface StaffSpec {
  clef?: Clef
  notes?: number[]
  /** Destaca uma linha (1–5) ou espaço (1–4) da pauta, contando de baixo para cima */
  highlight?: { kind: 'line' | 'space'; index: number }
  /** Mostra o nome das notas abaixo da pauta */
  labels?: boolean
}

/** Figuras musicais pelo número de equivalência: 1 = semibreve … 64 = semifusa */
export type FigureValue = 1 | 2 | 4 | 8 | 16 | 32 | 64

export interface FigureRef {
  kind: 'note' | 'rest'
  value: FigureValue
}

export type BarStyle = 'single' | 'double' | 'final'

export type RhythmItem =
  | { t: 'note'; v: FigureValue; pos?: number }
  | { t: 'rest'; v: FigureValue }
  | { t: 'bar'; style: BarStyle }
  | { t: 'label'; text: string }

export interface RhythmSpec {
  items: RhythmItem[]
  timeSig?: [number, number]
  clef?: Clef
  /** Pauta de uma linha só (ritmo), em vez de cinco */
  singleLine?: boolean
  /** Mostra a contagem dos tempos abaixo das figuras */
  counts?: boolean
}

/** Ilustrações usadas em questões e opções */
export type Visual =
  | { type: 'staff'; spec: StaffSpec }
  | { type: 'figures'; items: FigureRef[]; join?: boolean }
  | { type: 'rhythm'; spec: RhythmSpec }
  | { type: 'timeSig'; top: number; bottom: number }
  | { type: 'beams'; values: (8 | 16)[] }
  | { type: 'noteParts'; highlight: 'head' | 'stem' | 'flag' }
  | { type: 'barline'; style: BarStyle }

export type SoundDemo =
  | 'melody'
  | 'harmony'
  | 'rhythm'
  | 'timbre'
  | 'duration'
  | 'pitch'
  | 'intensity'

export type TheoryBlock =
  | { kind: 'p'; text: string }
  | { kind: 'def'; term: string; text: string }
  | { kind: 'tip'; text: string }
  | { kind: 'warn'; text: string }
  | { kind: 'wave' }
  | { kind: 'instruments'; families: { name: string; items: string[] }[] }
  | { kind: 'cards'; items: { title: string; text: string; play?: SoundDemo }[] }
  | { kind: 'staircase' }
  | { kind: 'octaves' }
  | { kind: 'staffAnatomy' }
  | { kind: 'staff'; spec: StaffSpec; caption?: string }
  | { kind: 'clefs' }
  | { kind: 'h'; text: string }
  | { kind: 'figuresTable' }
  | { kind: 'chocolate' }
  | { kind: 'noteAnatomy' }
  | { kind: 'beams' }
  | { kind: 'rhythm'; spec: RhythmSpec; caption?: string; metronome?: boolean }
  | { kind: 'barlines' }
  | { kind: 'timeSig' }
  | { kind: 'pulse' }

export interface TheorySection {
  id: string // ex.: "1.1"
  title: string
  blocks: TheoryBlock[]
}

export interface ChoiceQuestion {
  id: string
  section: string
  type: 'choice'
  prompt: string
  staff?: StaffSpec
  /** Símbolo musical grande exibido acima das opções (ex.: uma clave) */
  glyph?: string
  /** Ilustração exibida acima das opções */
  visual?: Visual
  options: string[]
  /** Ilustração de cada opção (o texto em options continua sendo usado no feedback) */
  optionVisuals?: Visual[]
  /** Índice da opção correta */
  answer: number
  explain?: string
}

export interface FillQuestion {
  id: string
  section: string
  type: 'fill'
  prompt?: string
  /** Frase com lacunas marcadas por "___" */
  text: string
  /** Respostas em ordem, uma para cada lacuna */
  answers: string[]
  /** Palavras extras (distratores). As respostas corretas são adicionadas automaticamente. */
  distractors: string[]
  explain?: string
}

export type Question = ChoiceQuestion | FillQuestion

export interface ModuleDef {
  id: number
  title: string
  subtitle: string
  available: boolean
  theory: TheorySection[]
  questions: Question[]
}

// ---------- Usuário ----------

export interface ModuleProgress {
  bestScore: number // 0–100
  attempts: number
  theoryRead: boolean
  lastPlayedAt?: string
}

export interface GameStat {
  best: number
  plays: number
  lastPlayedAt?: string
}

export interface UserDoc {
  email: string
  /** Nome exibido no perfil e no ranking (opcional; sem ele usamos o início do e-mail) */
  name?: string
  /** XP total acumulado (nunca zera) */
  xp: number
  streak: number
  bestStreak: number
  lastActiveDate: string | null // YYYY-MM-DD no fuso do usuário
  modules: Record<string, ModuleProgress>
  /** XP da semana atual do ranking (zera toda segunda-feira) */
  weeklyXp?: number
  /** Semana ISO a que weeklyXp se refere, ex.: "2026-W45" */
  weekKey?: string | null
  /** Quantas vezes o usuário terminou a semana em 1º lugar */
  weeklyWins?: number
  lastWinWeek?: string
  /** Recordes dos jogos do Ensaio, por jogo/modo */
  games?: Record<string, GameStat>
  createdAt: string
  updatedAt: string
}

export interface RankingEntry {
  name: string
  xp: number
  streak: number
  wins: number
  isMe?: boolean
}

export interface RankingResponse {
  week: string
  endsAt: string
  entries: RankingEntry[]
  myPosition: number | null
  myWeeklyXp: number
  lastWinners: string[]
}
