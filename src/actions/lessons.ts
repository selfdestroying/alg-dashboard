'use server'

import { Option } from '@/components/ui/multiselect'
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

export async function updateTeacherLesson(
  lessonId: number,
  currentTeachers: Option[],
  newTeachers: Option[]
) {
  const currentTeacherIds = currentTeachers.map((teacher) => +teacher.value)
  const newTeacherIds = newTeachers.map((teacher) => +teacher.value)

  const currentSet = new Set(currentTeacherIds)
  const newSet = new Set(newTeacherIds)

  const toDelete = currentTeacherIds.filter((id) => !newSet.has(id))

  const toAdd = newTeacherIds.filter((id) => !currentSet.has(id))

  await prisma.$transaction(async (tx) => {
    if (toDelete.length > 0) {
      await tx.teacherLesson.deleteMany({
        where: {
          lessonId,
          teacherId: { in: toDelete },
        },
      })
    }

    if (toAdd.length > 0) {
      await tx.teacherLesson.createMany({
        data: toAdd.map((teacherId) => ({
          lessonId,
          teacherId,
        })),
        skipDuplicates: true,
      })
    }
  })

  revalidatePath(`/dashboard/lessons/${lessonId}`)
}
