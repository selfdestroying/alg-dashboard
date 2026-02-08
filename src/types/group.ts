import { Prisma } from '@/prisma/generated/client'

export type GroupDTO = Prisma.GroupGetPayload<{
  include: {
    location: true
    course: true
    students: true
    teachers: {
      include: {
        teacher: true
      }
    }
  }
}>
