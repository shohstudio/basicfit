import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const count = await prisma.member.count()
    console.log(`Total members: ${count}`)

    const sample = await prisma.member.findMany({ take: 5, orderBy: { createdAt: 'desc' } })
    console.log('Latest 5 members:', sample)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
