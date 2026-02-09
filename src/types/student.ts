import { Prisma } from '@/prisma/generated/client'

export type StudentWithGroupsAndAttendance = Prisma.StudentGetPayload<{
  include: {
    groups: { include: { group: { include: { lessons: true; course: true; location: true } } } }
    attendances: {
      include: {
        lesson: true
        asMakeupFor: { include: { missedAttendance: { include: { lesson: true } } } }
        missedMakeup: { include: { makeUpAttendance: { include: { lesson: true } } } }
      }
    }
  }
}>

export type StudentDTO1 = Prisma.StudentGetPayload<{
  include: {
    groups: {
      include: {
        group: {
          include: {
            location: true
            course: true
            students: true
            lessons: true
            teachers: {
              include: {
                teacher: true
              }
            }
          }
        }
      }
    }
    attendances: {
      include: {
        lesson: true
        asMakeupFor: { include: { missedAttendance: { include: { lesson: true } } } }
        missedMakeup: { include: { makeUpAttendance: { include: { lesson: true } } } }
      }
    }
  }
}>

export interface StudentDTO {
  id: number
  firstName: string
  lastName: string | null
  login: string
  password: string
  age: number
  birthDate: Date | null
  parentsName: string | null
  parentsPhone: string | null
  crmUrl: string | null
  createdAt: Date
  coins: number
  lessonsBalance: number
  totalLessons: number
  totalPayments: number
}
