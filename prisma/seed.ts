import { Prisma, PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function getUsers(): Promise<Prisma.UserCreateManyInput[]> {
  return [
    {
      firstName: 'Максим',
      password: await bcrypt.hash('admin', 10),
      role: 'ADMIN',
      passwordRequired: true,
    },
    {
      firstName: 'Саша',
      password: await bcrypt.hash('owner', 10),
      role: 'OWNER',
      passwordRequired: true,
    },
    {
      firstName: 'Настя',
      password: await bcrypt.hash('owner', 10),
      role: 'OWNER',
      passwordRequired: true,
    },
    {
      firstName: 'Рита',
      password: await bcrypt.hash('manager', 10),
      role: 'MANAGER',
      passwordRequired: true,
    },
    {
      firstName: 'Маша',
      password: await bcrypt.hash('manager', 10),
      role: 'MANAGER',
      passwordRequired: true,
    },
    {
      firstName: 'Наташа',
      password: await bcrypt.hash('teacher', 10),
      role: 'TEACHER',
      passwordRequired: true,
    },
    {
      firstName: 'Федя',
      password: await bcrypt.hash('teacher', 10),
      role: 'TEACHER',
      passwordRequired: true,
    },
  ]
}
export async function main() {
  await prisma.user.createMany({ data: await getUsers() })
}

main()
