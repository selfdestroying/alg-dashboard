import { Prisma } from '@/prisma/generated/client'

export type AbsentAttendance = Prisma.AttendanceGetPayload<{
  include: {
    student: true
    lesson: {
      include: {
        group: {
          include: {
            course: true
            location: true
            schedules: true
            teachers: {
              include: {
                teacher: true
              }
            }
          }
        }
      }
    }
    asMakeupFor: { include: { missedAttendance: { include: { lesson: true } } } }
    missedMakeup: { include: { makeUpAttendance: { include: { lesson: true } } } }
  }
}>
