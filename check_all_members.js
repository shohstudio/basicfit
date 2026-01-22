
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const members = await prisma.member.findMany({
        select: { id: true, fullName: true }
    });
    console.log(`Total members: ${members.length}`);
    members.forEach(m => console.log(`${m.id.substring(0, 8)} - ${m.fullName}`));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
