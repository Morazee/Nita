import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "@/server/schema"

function createDb(databaseUrl: string) {
  return drizzle(neon(databaseUrl), { schema, logger: true })
}

type Db = ReturnType<typeof createDb>

let dbInstance: Db | null = null

export function getDb() {
  const databaseUrl = process.env.POSTGRES_URL
  if (!databaseUrl) {
    throw new Error("POSTGRES_URL is required")
  }
  if (!dbInstance) {
    dbInstance = createDb(databaseUrl)
  }
  return dbInstance
}

export const db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver)
  },
})
