import { Prisma } from '@/prisma/generated/client'

export type StudentWithGroupsAndAttendance = Prisma.StudentGetPayload<{
  include: {
    groups: {
      include: {
        group: {
          include: {
            lessons: {
              include: {
                attendance: {
                  include: {
                    missedMakeup: {
                      include: { makeUpAttendance: { include: { lesson: true } } }
                    }
                  }
                }
              }
            }
            course: true
            location: true
            schedules: true
          }
        }
      }
    }
    wallets: {
      include: {
        studentGroups: {
          include: {
            group: { include: { course: true; location: true; schedules: true } }
          }
        }
      }
    }
    attendances: {
      include: {
        lesson: {
          include: {
            group: {
              include: { course: true; schedules: true; _count: { select: { lessons: true } } }
            }
          }
        }
        asMakeupFor: true
        missedMakeup: { include: { makeUpAttendance: true } }
      }
    }
  }
}>
