
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const members = await prisma.member.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { subscriptions: true }
    });
    console.log(JSON.stringify(members, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
