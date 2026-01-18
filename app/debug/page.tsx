
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function DebugPage() {
    // 1. Check Env
    const dbUrl = process.env.DATABASE_URL;

    // 2. Fetch Data
    const membersCount = await prisma.member.count();
    const subsCount = await prisma.subscription.count();

    // 3. Get Recent Members and their Subs
    const recentMembers = await prisma.member.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { subscriptions: true }
    });

    return (
        <div className="p-10 font-mono text-sm">
            <h1 className="text-2xl font-bold mb-4">Database Debug</h1>

            <div className="mb-6 p-4 bg-gray-100 rounded">
                <p><strong>DATABASE_URL:</strong> {dbUrl}</p>
                <p><strong>Members Count:</strong> {membersCount}</p>
                <p><strong>Subscriptions Count:</strong> {subsCount}</p>
            </div>

            <h2 className="text-xl font-bold mb-2">Recent Members (Last 5)</h2>
            <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-auto">
                {JSON.stringify(recentMembers, null, 2)}
            </pre>
        </div>
    );
}
