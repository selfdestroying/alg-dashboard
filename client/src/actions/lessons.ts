'use server'

import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { createAttendance } from './attendance'

export type LessonWithCountUnspecified = Prisma.LessonGetPayload<{
  include: { _count: { select: { attendance: { where: { status: 'UNSPECIFIED' } } } } }
}>
export type LessonWithAttendance = Prisma.LessonGetPayload<{
  include: { attendance: { include: { student: true; asMakeupFor: true; missedMakeup: true } } }
}>

export type LessonWithAttendanceAndGroup = Prisma.LessonGetPayload<{
  include: { attendance: { include: { student: true } }; group: { include: { teacher: true } } }
}>

export const getLessons = async (): Promise<LessonWithAttendanceAndGroup[]> => {
  const lessons = await prisma.lesson.findMany({
    include: { attendance: { include: { student: true } }, group: { include: { teacher: true } } },
    orderBy: { date: 'asc' },
  })
  return lessons
}

export const getLessonsByTeacherId = async (id: number) => {
  const lessons = await prisma.lesson.findMany({ where: { group: { teacherId: id } } })
}

export const getLesson = async (id: number): Promise<LessonWithAttendance | null> => {
  const lesson = await prisma.lesson.findFirst({
    where: { id },
    include: { attendance: { include: { student: true, asMakeupFor: true, missedMakeup: true } } },
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
