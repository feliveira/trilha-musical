import { MongoClient, type Collection } from 'mongodb'
import type { UserDoc } from '#shared/types'

/**
 * Camada de persistência.
 * - Com NUXT_MONGODB_URI definido: MongoDB (Atlas).
 * - Sem ele: arquivo local em .data/ (apenas para desenvolvimento).
 */

let clientPromise: Promise<MongoClient> | null = null
let warned = false

async function getCollection(): Promise<Collection<UserDoc> | null> {
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
    clientPromise = new MongoClient(uri, { maxPoolSize: 5 }).connect().then(async (client) => {
      const users = client.db(dbName).collection<UserDoc>('users')
      await users.createIndex({ email: 1 }, { unique: true })
      await users.createIndex({ xp: -1 })
      return client
    })
    clientPromise.catch(() => {
      clientPromise = null
    })
  }
  const client = await clientPromise
  return client.db(dbName).collection<UserDoc>('users')
}

// ---------- fallback local ----------
const LOCAL_KEY = 'users.json'

async function readLocal(): Promise<Record<string, UserDoc>> {
  return ((await useStorage('data').getItem(LOCAL_KEY)) as Record<string, UserDoc> | null) ?? {}
}

async function writeLocal(all: Record<string, UserDoc>) {
  await useStorage('data').setItem(LOCAL_KEY, all)
}

// ---------- API ----------

export async function findUser(email: string): Promise<UserDoc | null> {
  const col = await getCollection()
  if (col) return col.findOne({ email }, { projection: { _id: 0 } })
  return (await readLocal())[email] ?? null
}

export async function saveUser(user: UserDoc): Promise<void> {
  user.updatedAt = new Date().toISOString()
  const col = await getCollection()
  if (col) {
    await col.replaceOne({ email: user.email }, user, { upsert: true })
    return
  }
  const all = await readLocal()
  all[user.email] = user
  await writeLocal(all)
}

export async function topUsers(limit: number): Promise<UserDoc[]> {
  const col = await getCollection()
  if (col) {
    return col
      .find({}, { projection: { _id: 0 } })
      .sort({ xp: -1 })
      .limit(limit)
      .toArray()
  }
  return Object.values(await readLocal())
    .sort((a, b) => b.xp - a.xp)
    .slice(0, limit)
}

export async function countUsersAbove(xp: number): Promise<number> {
  const col = await getCollection()
  if (col) return col.countDocuments({ xp: { $gt: xp } })
  return Object.values(await readLocal()).filter((u) => u.xp > xp).length
}
