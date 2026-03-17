import { Prisma } from '@/prisma/generated/client'

export type StudentWithGroups = Prisma.StudentGetPayload<{
  include: { groups: true; wallets: true; parents: { include: { parent: true } } }
}>
