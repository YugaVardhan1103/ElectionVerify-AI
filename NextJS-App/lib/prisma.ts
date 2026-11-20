/**
 * ElectionVerify AI - Next.js Reusable Prisma Client Instance
 *
 * Implements a singleton PrismaClient instance for Next.js 15 to prevent
 * connection exhaustion caused by fast refresh/hot reloading in development.
 *
 * Usage:
 *   import prisma from "@/lib/prisma";
 *   // or
 *   import { prisma } from "@/lib/prisma";
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
