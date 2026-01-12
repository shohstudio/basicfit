import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

const isProduction = process.env.NODE_ENV === "production";

let adapter;

if (url && authToken) {
    const turso = createClient({ url, authToken });
    adapter = new PrismaLibSQL(turso);
} else if (!isProduction) {
    const turso = createClient({ url: "file:dev.db" });
    adapter = new PrismaLibSQL(turso);
} else {
    // In production build, if env vars are missing, we can't connect.
    // However, failing here might break the build. 
    // We will throw a clear error to help debug Vercel logs.
    throw new Error("MISSING TURSO ENV VARS: TURSO_DATABASE_URL or TURSO_AUTH_TOKEN is not set.");
}

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        adapter,
        log: ["query"],
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
