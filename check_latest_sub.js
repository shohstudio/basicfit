
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Get the most recently created member
    const latestMember = await prisma.member.findFirst({
        orderBy: { createdAt: 'desc' },
        include: { subscriptions: true }
    });

    if (!latestMember) {
        console.log("No members found.");
        return;
    }

    console.log("Latest Member:", latestMember.fullName);
    console.log("Created At:", latestMember.createdAt);
    console.log("Subscriptions:", JSON.stringify(latestMember.subscriptions, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
