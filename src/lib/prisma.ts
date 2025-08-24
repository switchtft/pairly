// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

const prisma = globalThis.prisma || new PrismaClient({
  log: ['error', 'warn'],
  // Dodaj connection pooling i timeout settings
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

// Graceful shutdown handlers
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })

  process.on('SIGINT', async () => {
    await prisma.$disconnect()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
}

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma

export default prisma