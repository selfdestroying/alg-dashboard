'use server'

import prisma from '@/lib/prisma'
import { Attendance, Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export type AttendanceWithStudents = Prisma.AttendanceGetPayload<{
  include: { student: true; missedMakeup: true; asMakeupFor: true }
}>

export const createAttendance = async (
  data: Prisma.AttendanceUncheckedCreateInput
): Promise<Attendance> => {
  return await prisma.attendance.create({ data })
}

export const updateAttendance = async (data: AttendanceWithStudents[]) => {
  await prisma.$transaction(
    data.map((item) =>
      prisma.attendance.update({
        where: { id: item.id },
        data: {
          status: item.status,
          comment: item.comment,
        },
      })
    )
  )

  // например: перерисуем страницу списка
  revalidatePath(`dashboard/lessons/${data[0].lessonId}`)
}
