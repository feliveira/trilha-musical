import { MongoClient, type Collection } from 'mongodb'
import type { UserDoc } from '#shared/types'

/**
 * Camada de persistência.
 * - Com NUXT_MONGODB_URI definido: MongoDB (Atlas).
 * - Sem ele: arquivo local em .data/ (apenas para desenvolvimento).
 */

interface MetaDoc {
  _id: string
  currentWeek?: string
  lastWinners?: string[]
  /** Versão dos índices já criados (documento _id: 'schema') */
  version?: number
}

/** Campos que o ranking precisa — evita trafegar o documento inteiro de cada aluno */
export type RankingRow = Pick<UserDoc, 'email' | 'name' | 'weeklyXp' | 'streak' | 'lastActiveDate' | 'weeklyWins'>
const RANKING_PROJECTION = { _id: 0, email: 1, name: 1, weeklyXp: 1, streak: 1, lastActiveDate: 1, weeklyWins: 1 } as const

/** Aumente quando mudar os índices abaixo; eles são recriados uma única vez */
const SCHEMA_VERSION = 2

let clientPromise: Promise<MongoClient> | null = null
let warned = false

/**
 * Cria os índices só quando a versão salva no banco é antiga.
 * Assim cada nova instância serverless faz 1 leitura, em vez de recriar os índices.
 */
async function ensureIndexes(client: MongoClient, dbName: string) {
  const db = client.db(dbName)
  const meta = db.collection<MetaDoc>('meta')
  const schema = await meta.findOne({ _id: 'schema' }, { projection: { version: 1 } })
  if ((schema?.version ?? 0) >= SCHEMA_VERSION) return
  const users = db.collection<UserDoc>('users')
  await users.createIndex({ email: 1 }, { unique: true })
  await users.createIndex({ weekKey: 1, weeklyXp: -1 })
  // v2: remove o índice do ranking antigo (XP total), que não é mais usado
  await users.dropIndex('xp_-1').catch(() => {})
  await meta.updateOne({ _id: 'schema' }, { $set: { version: SCHEMA_VERSION } }, { upsert: true })
}

async function getDb() {
  const config = useRuntimeConfig()
  const uri = (config.mongodbUri as string) || process.env.MONGODB_URI
  if (!uri) {
    if (!warned) {
      console.warn('[store] NUXT_MONGODB_URI não definido — usando armazenamento local em .data/ (somente dev).')
      warned = true
    }
    return null
  }
  const dbName = (config.mongodbDb as string) || 'trilha-musical'

  if (!clientPromise) {
    // Ajustes para serverless (Vercel): poucas conexões por instância, fechadas quando ociosas,
    // e monitoramento por polling (1 conexão por servidor em vez de 2).
    const client = new MongoClient(uri, {
      maxPoolSize: 2,
      minPoolSize: 0,
      maxIdleTimeMS: 60_000,
      serverMonitoringMode: 'poll',
    })
    clientPromise = client.connect().then(async (c) => {
      await ensureIndexes(c, dbName)
      return c
    })
    clientPromise.catch(() => {
      clientPromise = null
    })
  }
  return (await clientPromise).db(dbName)
}

async function usersCol(): Promise<Collection<UserDoc> | null> {
  const db = await getDb()
  return db ? db.collection<UserDoc>('users') : null
}

async function metaCol(): Promise<Collection<MetaDoc> | null> {
  const db = await getDb()
  return db ? db.collection<MetaDoc>('meta') : null
}

// ---------- fallback local ----------
const LOCAL_KEY = 'users.json'
const LOCAL_META = 'meta.json'

async function readLocal(): Promise<Record<string, UserDoc>> {
  return ((await useStorage('data').getItem(LOCAL_KEY)) as Record<string, UserDoc> | null) ?? {}
}

async function writeLocal(all: Record<string, UserDoc>) {
  await useStorage('data').setItem(LOCAL_KEY, all)
}

async function readLocalMeta(): Promise<Omit<MetaDoc, '_id'>> {
  return ((await useStorage('data').getItem(LOCAL_META)) as Omit<MetaDoc, '_id'> | null) ?? {}
}

// ---------- usuários ----------

export async function findUser(email: string): Promise<UserDoc | null> {
  const col = await usersCol()
  if (col) return col.findOne({ email }, { projection: { _id: 0 } })
  return (await readLocal())[email] ?? null
}

export async function saveUser(user: UserDoc): Promise<void> {
  user.updatedAt = new Date().toISOString()
  const col = await usersCol()
  if (col) {
    await col.replaceOne({ email: user.email }, user, { upsert: true })
    return
  }
  const all = await readLocal()
  all[user.email] = user
  await writeLocal(all)
}

// ---------- ranking semanal ----------

export async function topWeekly(week: string, limit: number): Promise<RankingRow[]> {
  const col = await usersCol()
  if (col) {
    return col
      .find({ weekKey: week, weeklyXp: { $gt: 0 } }, { projection: RANKING_PROJECTION })
      .sort({ weeklyXp: -1, updatedAt: 1 })
      .limit(limit)
      .toArray() as Promise<RankingRow[]>
  }
  return Object.values(await readLocal())
    .filter((u) => u.weekKey === week && (u.weeklyXp ?? 0) > 0)
    .sort((a, b) => (b.weeklyXp ?? 0) - (a.weeklyXp ?? 0))
    .slice(0, limit)
}

/** XP semanal de um aluno, lendo só os dois campos necessários */
export async function findWeeklyXp(email: string, week: string): Promise<number> {
  const col = await usersCol()
  const u = col
    ? await col.findOne({ email }, { projection: { _id: 0, weekKey: 1, weeklyXp: 1 } })
    : (await readLocal())[email]
  return u && u.weekKey === week ? (u.weeklyXp ?? 0) : 0
}

export async function countWeeklyAbove(week: string, xp: number): Promise<number> {
  const col = await usersCol()
  if (col) return col.countDocuments({ weekKey: week, weeklyXp: { $gt: xp } })
  return Object.values(await readLocal()).filter((u) => u.weekKey === week && (u.weeklyXp ?? 0) > xp).length
}

export async function getLastWinners(): Promise<string[]> {
  const meta = await metaCol()
  if (meta) return (await meta.findOne({ _id: 'ranking' }))?.lastWinners ?? []
  return (await readLocalMeta()).lastWinners ?? []
}

/**
 * Troca a semana do ranking quando ela vira. Retorna a semana que acabou de ser
 * encerrada (ou null). A troca é atômica: só uma requisição encerra a semana.
 */
async function claimRollover(newWeek: string): Promise<string | null> {
  const meta = await metaCol()
  if (meta) {
    const before = await meta.findOneAndUpdate(
      { _id: 'ranking', currentWeek: { $ne: newWeek } },
      { $set: { currentWeek: newWeek } },
      { returnDocument: 'before' },
    )
    if (before) return before.currentWeek ?? null
    try {
      await meta.insertOne({ _id: 'ranking', currentWeek: newWeek })
    } catch {
      // já existe e já está na semana atual
    }
    return null
  }
  const local = await readLocalMeta()
  if (local.currentWeek === newWeek) return null
  const prev = local.currentWeek ?? null
  await useStorage('data').setItem(LOCAL_META, { ...local, currentWeek: newWeek })
  return prev
}

/** Dá a vitória ao(s) 1º(s) colocado(s) da semana encerrada e apaga os dados semanais */
async function closeWeek(week: string) {
  const col = await usersCol()
  if (col) {
    const [top] = await col
      .find({ weekKey: week, weeklyXp: { $gt: 0 } }, { projection: { _id: 0, weeklyXp: 1 } })
      .sort({ weeklyXp: -1 })
      .limit(1)
      .toArray()
    let winners: string[] = []
    if (top) {
      const winnerDocs = await col
        .find({ weekKey: week, weeklyXp: top.weeklyXp }, { projection: { _id: 0, email: 1, name: 1 } })
        .toArray()
      winners = winnerDocs.map((u) => publicName(u))
      await col.updateMany(
        { weekKey: week, weeklyXp: top.weeklyXp },
        { $inc: { weeklyWins: 1 }, $set: { lastWinWeek: week } },
      )
    }
    await col.updateMany({ weekKey: week }, { $set: { weeklyXp: 0 }, $unset: { weekKey: '' } })
    await (await metaCol())!.updateOne({ _id: 'ranking' }, { $set: { lastWinners: winners } })
    return
  }

  const all = await readLocal()
  const inWeek = Object.values(all).filter((u) => u.weekKey === week && (u.weeklyXp ?? 0) > 0)
  const best = Math.max(0, ...inWeek.map((u) => u.weeklyXp ?? 0))
  const winners: string[] = []
  for (const u of Object.values(all)) {
    if (u.weekKey !== week) continue
    if (best > 0 && u.weeklyXp === best) {
      u.weeklyWins = (u.weeklyWins ?? 0) + 1
      u.lastWinWeek = week
      winners.push(publicName(u))
    }
    u.weeklyXp = 0
    u.weekKey = null
  }
  await writeLocal(all)
  const local = await readLocalMeta()
  await useStorage('data').setItem(LOCAL_META, { ...local, lastWinners: winners })
}

let checkedWeek: string | null = null

/** Garante que o ranking está na semana atual (encerra a anterior se preciso) */
export async function ensureCurrentWeek(week: string) {
  if (checkedWeek === week) return
  const ended = await claimRollover(week)
  if (ended && ended !== week) await closeWeek(ended)
  checkedWeek = week
}
