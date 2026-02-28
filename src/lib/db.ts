import { PrismaClient } from '@prisma/client'

// Supabase uses PgBouncer in transaction mode.
// PgBouncer drops prepared statements between connections → PostgreSQL error 26000.
// Fix: append ?pgbouncer=true to the DATABASE_URL so Prisma uses simple query
// protocol instead of extended query protocol (prepared statements).
function buildDatabaseUrl(): string {
  const url = process.env.DATABASE_URL ?? "";
  if (!url || url.includes("pgbouncer=true")) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}pgbouncer=true`;
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: buildDatabaseUrl(),
      },
    },
  });
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

// In development, always create a fresh instance after file changes so that
// the pgbouncer fix and new generated types always take effect.
// In production, reuse the singleton to avoid connection pool exhaustion.
const prisma = process.env.NODE_ENV === 'production'
  ? (globalThis.prismaGlobal ?? prismaClientSingleton())
  : prismaClientSingleton();

export default prisma
export { prisma }

if (process.env.NODE_ENV === 'production') globalThis.prismaGlobal = prisma
