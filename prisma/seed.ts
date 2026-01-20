import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const maleNames = [
  'Alisher', 'Bobur', 'Sardor', 'Sanjar', 'Jaxongir', 'Otabek', 'Ulugbek',
  'Bekzod', 'Sherzod', 'Farruh', 'Jamshid', 'Dilshod', 'Ravshan', 'Rustam',
  'Temur', 'Aziz', 'Jasur', 'Elbek', 'Oybek', 'Sarvar'
]

const femaleNames = [
  'Malika', 'Sevara', 'Shahlo', 'Nargiza', 'Gulnoza', 'Dilnoza', 'Feruza',
  'Zebo', 'Ra\'no', 'Laylo', 'Madina', 'Munisa', 'Nigora', 'Kamola', 'Dildora',
  'Guli', 'Barno', 'Zilola', 'Oydin', 'Saida'
]

const surnames = [
  'Karimov', 'Rahmonov', 'Ahmedov', 'Abdullayev', 'Ibragimov', 'Yusupov',
  'Umarov', 'Saidov', 'Nazarov', 'Rustamov', 'Oripov', 'Ismailov', 'Kasimov',
  'Tursunov', 'Sultonov', 'Rakhimov', 'Azimov', 'Saidov', 'Mirzayev', 'Sobirov'
]

function getRandomElement(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generatePhoneNumber() {
  const codes = ['90', '91', '93', '94', '95', '99', '97', '88', '33']
  const code = getRandomElement(codes)
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0')
  return `+998${code}${number}`
}

async function main() {
  console.log('Start seeding 200 Uzbek users...')

  for (let i = 0; i < 200; i++) {
    const isMale = Math.random() > 0.5
    const firstName = isMale ? getRandomElement(maleNames) : getRandomElement(femaleNames)
    let lastName = getRandomElement(surnames)

    if (!isMale) {
      if (lastName.endsWith('ov')) lastName += 'a'
      else if (lastName.endsWith('ev')) lastName += 'a'
    }

    const fullName = `${firstName} ${lastName}`
    const phone = generatePhoneNumber()

    // Generate a unique email if needed, or leave it optional/null. 
    // Schema says email is optional unique. To avoid conflict, let's leave it null or generate unique.
    // Let's leave it null to save space and avoid conflicts, or generate fake ones.
    // User didn't ask for emails.

    try {
      const user = await prisma.member.create({
        data: {
          fullName,
          phone,
          status: 'ACTIVE',
        },
      })
      console.log(`Created user ${i + 1}: ${user.fullName} (${user.phone})`)
    } catch (e) {
      console.error(`Failed to create user ${i + 1}:`, e)
    }
  }

  console.log('Seeding finished.')
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
