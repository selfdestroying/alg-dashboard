'use server'

import { prisma } from '@/lib/prisma'

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

export const getLesson = async (payload: Prisma.LessonFindFirstArgs) => {
  const lesson = await prisma.lesson.findFirst(payload)
  return lesson
}

export const updateLesson = async (payload: Prisma.LessonUpdateArgs) => {
  await prisma.lesson.update(payload)
  revalidatePath(`/dashboard/lessons/${payload.where.id}`)
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

export async function addTeacherToLesson(payload: Prisma.TeacherLessonCreateArgs) {
  await prisma.teacherLesson.create(payload)
  revalidatePath(`/dashboard/lessons/${payload.data.lessonId}`)
}

export async function removeTeacherFromLesson(payload: Prisma.TeacherLessonDeleteArgs) {
  await prisma.teacherLesson.delete(payload)
  revalidatePath(`/dashboard/lessons/${payload.where.lessonId}`)
}

export async function updateTeacherLesson(payload: Prisma.TeacherLessonUpdateArgs) {
  await prisma.teacherLesson.update(payload)
  revalidatePath(`/dashboard/lessons/${payload.where.lessonId}`)
}
