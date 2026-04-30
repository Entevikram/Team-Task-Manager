import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const getPrismaClient = (): PrismaClient => {
  const existing = globalForPrisma.prisma
  if (existing) return existing

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is not set. Set it via environment variables (e.g., Railway env vars).',
    )
  }

  const pool = new Pool({ connectionString: databaseUrl })
  const adapter = new PrismaPg(pool)

  const client = new PrismaClient({ adapter })
  globalForPrisma.prisma = client
  return client
}

const prisma = new Proxy(
  {},
  {
    get(_target, prop) {
      const client = getPrismaClient()
      const clientRecord = client as unknown as Record<PropertyKey, unknown>
      const value = clientRecord[prop]

      if (typeof value === 'function') {
        return (value as (...args: unknown[]) => unknown).bind(client)
      }

      return value
    },
  },
) as unknown as PrismaClient

export { prisma }
