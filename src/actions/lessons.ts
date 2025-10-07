'use server'

import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { createAttendance } from './attendance'

export type LessonWithCountUnspecified = Prisma.LessonGetPayload<{
  include: { _count: { select: { attendance: { where: { status: 'UNSPECIFIED' } } } } }
}>
export type LessonWithGroupAndAttendance = Prisma.LessonGetPayload<{
  include: {
    teachers: {
      include: {
        teacher: {
          omit: {
            password: true
            passwordRequired: true
            createdAt: true
          }
        }
      }
    }
    group: { include: { _count: { select: { students: true } } } }
    attendance: {
      include: {
        student: true
        asMakeupFor: { include: { missedAttendance: { include: { lesson: true } } } }
        missedMakeup: { include: { makeUpAttendance: { include: { lesson: true } } } }
      }
    }
  }
}>

export type LessonWithAttendanceAndGroup = Prisma.LessonGetPayload<{
  include: {
    attendance: { include: { student: true } }
    group: {
      include: {
        teachers: {
          include: {
            teacher: {
              omit: {
                password: true
                passwordRequired: true
                createdAt: true
              }
            }
          }
        }
      }
    }
  }
}>

export const getLessons = async <T extends Prisma.LessonFindManyArgs>(
  payload?: Prisma.SelectSubset<T, Prisma.LessonFindManyArgs>
) => {
  return prisma.lesson.findMany(payload)
}
export const getUpcomingLessons = async (): Promise<LessonWithAttendanceAndGroup[]> => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const lessons = await prisma.lesson.findMany({
    where: { date: { gte: today } },
    include: {
      attendance: { include: { student: true } },
      group: {
        include: {
          teachers: {
            include: {
              teacher: {
                omit: {
                  password: true,
                  passwordRequired: true,
                  createdAt: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { date: 'asc' },
  })
  return lessons
}

export const getLesson = async (id: number): Promise<LessonWithGroupAndAttendance | null> => {
  const lesson = await prisma.lesson.findFirst({
    where: { id },
    include: {
      teachers: {
        include: {
          teacher: {
            omit: {
              password: true,
              passwordRequired: true,
              createdAt: true,
            },
          },
        },
      },
      group: { include: { _count: { select: { students: true } } } },
      attendance: {
        include: {
          student: true,
          asMakeupFor: { include: { missedAttendance: { include: { lesson: true } } } },
          missedMakeup: { include: { makeUpAttendance: { include: { lesson: true } } } },
        },
        orderBy: {
          id: 'asc',
        },
      },
    },
  })
  return lesson
}

export const createLesson = async (data: Prisma.LessonUncheckedCreateInput) => {
  const lesson = await prisma.lesson.create({ data })
  const students = await prisma.student.findMany({
    where: { groups: { some: { groupId: data.groupId } } },
  })
  students.forEach(
    async (student) =>
      await createAttendance({
        lessonId: lesson.id,
        studentId: student.id,
        comment: '',
        status: 'UNSPECIFIED',
      })
  )

  revalidatePath(`dashboard/groups/${data.groupId}`)
}
