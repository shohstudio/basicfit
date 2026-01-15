import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

const isProduction = process.env.NODE_ENV === "production";

let adapter;

if (url && authToken) {
    // Auto-fix protocol for serverless environments (libsql:// -> https://)
    const finalUrl = url.replace("libsql://", "https://");
    console.log("Initializing Turso Client with URL:", finalUrl.split("://")[0] + "://... (masked)");

    const turso = createClient({
        url: finalUrl,
        authToken
    });
    adapter = new PrismaLibSQL(turso);
} else if (!isProduction) {
    const turso = createClient({ url: "file:dev.db" });
    adapter = new PrismaLibSQL(turso);
} else {
    // In production build, if env vars are missing, we can't connect.
    // However, failing here breaks the build module load.
    // We will log error but return undefined adapter, causing runtime error later (caught by UI).
    console.error("MISSING TURSO ENV VARS: TURSO_DATABASE_URL or TURSO_AUTH_TOKEN is not set.");
}

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        ...(adapter ? { adapter } : {}),
        log: ["query"],
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
