import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const turso = createClient({
    url: process.env.TURSO_DATABASE_URL || "file:dev.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
});

const adapter = new PrismaLibSql(turso);

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        adapter,
        log: ["query"],
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
