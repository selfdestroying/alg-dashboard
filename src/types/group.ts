import { Prisma } from '@prisma/client'

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
