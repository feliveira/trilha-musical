import type { ModuleDef } from '#shared/types'
import { modulo01 } from './modulo-01'
import { modulo02 } from './modulo-02'

export const TOTAL_MODULES = 16

/** Nota mínima (%) no módulo anterior para liberar o próximo */
export const PASS_SCORE = 60

/** Quantidade de questões por sessão de exercícios */
export const QUESTIONS_PER_SESSION = 12

const ready: ModuleDef[] = [modulo01, modulo02]

/** Os 16 módulos do método. Os que ainda não têm conteúdo aparecem como "Em breve". */
export const modules: ModuleDef[] = Array.from({ length: TOTAL_MODULES }, (_, i) => {
  const id = i + 1
  return (
    ready.find((m) => m.id === id) ?? {
      id,
      title: `Módulo ${id}`,
      subtitle: 'Conteúdo em preparação',
      available: false,
      theory: [],
      questions: [],
    }
  )
})

export function getModule(id: number) {
  return modules.find((m) => m.id === id)
}
