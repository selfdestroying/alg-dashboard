import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'
import { PrismaClient } from './generated/client'

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

  const groups = await prisma.group.findMany({
    select: { id: true, dayOfWeek: true, time: true, organizationId: true },
  })

  console.log('Groups to backfill:', groups.length)

  for (const group of groups) {
    await prisma.groupSchedule.upsert({
      where: { groupId_dayOfWeek: { groupId: group.id, dayOfWeek: group.dayOfWeek } },
      create: {
        groupId: group.id,
        dayOfWeek: group.dayOfWeek,
        time: group.time,
        organizationId: group.organizationId,
      },
      update: {},
    })
  }

  console.log('Backfill complete')
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
