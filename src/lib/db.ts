import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Vercel integration for Prisma Postgres creates Prisma_Database_DATABASE_URL or Prisma_Database_POSTGRES_URL.
// Canonical variable is DATABASE_URL. We fallback to integration variables if DATABASE_URL is not set.
function resolveDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL ||
    process.env.Prisma_Database_DATABASE_URL ||
    process.env.Prisma_Database_POSTGRES_URL
  );
}

const resolvedUrl = resolveDatabaseUrl();

// Ensure process.env.DATABASE_URL is populated at runtime for Prisma Client
if (!process.env.DATABASE_URL && resolvedUrl) {
  process.env.DATABASE_URL = resolvedUrl;
}

if (!resolvedUrl && process.env.NODE_ENV === 'production') {
  console.error(
    '[RightMatch Database Config] Neither DATABASE_URL nor Prisma_Database_DATABASE_URL is set in environment.'
  );
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: resolvedUrl
      ? {
          db: {
            url: resolvedUrl,
          },
        }
      : undefined,
    log:
      process.env.NODE_ENV === 'development'
        ? ['warn', 'error']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
