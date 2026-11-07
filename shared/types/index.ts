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
  options: string[]
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

export interface UserDoc {
  email: string
  xp: number
  streak: number
  bestStreak: number
  lastActiveDate: string | null // YYYY-MM-DD no fuso do usuário
  modules: Record<string, ModuleProgress>
  createdAt: string
  updatedAt: string
}

export interface RankingEntry {
  name: string
  xp: number
  streak: number
  isMe?: boolean
}
