'use server'

import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'

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
  await prisma.lesson.create({ data })
  revalidatePath(`dashboard/groups/${data.groupId}`)
}
