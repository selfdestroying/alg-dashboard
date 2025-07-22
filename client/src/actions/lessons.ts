'use server'

import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { createAttendance } from './attendance'

export type LessonWithCountUnspecified = Prisma.LessonGetPayload<{
  include: { _count: { select: { attendance: { where: { status: 'UNSPECIFIED' } } } } }
}>
export type LessonWithAttendance = Prisma.LessonGetPayload<{
  include: { attendance: { include: { student: true } } }
}>

export const getLesson = async (id: number): Promise<LessonWithAttendance | null> => {
  const lesson = await prisma.lesson.findFirst({
    where: { id },
    include: { attendance: { include: { student: true } } },
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
