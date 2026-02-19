import { Prisma } from '@/prisma/generated/client'

export type GroupDTO = Prisma.GroupGetPayload<{
  include: {
    location: true
    course: true
    students: true
    schedules: true
    teachers: {
      include: {
        teacher: true
      }
    }
  }
}>
