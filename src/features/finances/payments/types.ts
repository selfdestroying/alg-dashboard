import { Prisma } from '@/prisma/generated/client'

export type PaymentWithStudentAndGroup = Prisma.PaymentGetPayload<{
  include: {
    student: true
    group: { include: { course: true; location: true } }
  }
}>

export type StudentWithGroupsForPayment = Prisma.StudentGetPayload<{
  include: {
    groups: {
      include: {
        group: { include: { course: true; location: true } }
      }
    }
  }
}>
