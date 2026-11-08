import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { maviriPrisma?: PrismaClient };

export function getPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required for database-backed features.");

  const prisma = globalForPrisma.maviriPrisma ?? new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });
  if (process.env.NODE_ENV !== "production") globalForPrisma.maviriPrisma = prisma;
  return prisma;
}
