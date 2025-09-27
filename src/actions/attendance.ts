'use server'

import prisma from '@/lib/prisma'
import { AttendanceStatus, Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export type AttendanceWithStudents = Prisma.AttendanceGetPayload<{
  include: {
    student: true
    asMakeupFor: { include: { missedAttendance: { include: { lesson: true } } } }
    missedMakeup: { include: { makeUpAttendance: { include: { lesson: true } } } }
  }
}>

export const createAttendance = async (data: Prisma.AttendanceUncheckedCreateInput) => {
  const attendance = await prisma.attendance.create({ data })
  revalidatePath(`dashboard/lessons/${data.lessonId}`)
  return attendance
}

const updateCoins = async (
  newStatus: AttendanceStatus,
  oldStatus: AttendanceStatus,
  studentId: number
) => {
  if (newStatus === AttendanceStatus.PRESENT && oldStatus !== AttendanceStatus.PRESENT) {
    await prisma.student.update({
      where: { id: studentId },
      data: { coins: { increment: 10 } },
    })
  } else if (newStatus !== AttendanceStatus.PRESENT && oldStatus === AttendanceStatus.PRESENT) {
    await prisma.student.update({
      where: { id: studentId },
      data: { coins: { decrement: 10 } },
    })
  }
}

export const updateAttendance = async (payload: Prisma.AttendanceUpdateArgs) => {
  const status = payload.data.status
  if (status) {
    const oldAttendance = await prisma.attendance.findFirst({
      where: {
        studentId: payload.where.studentId_lessonId?.studentId,
        lessonId: payload.where.studentId_lessonId?.lessonId,
      },
    })
    if (oldAttendance) {
      updateCoins(status as AttendanceStatus, oldAttendance.status, oldAttendance.studentId)
    }
  }
  await prisma.attendance.update(payload)
  // revalidatePath(`/dashboard/lessons/${payload.where.studentId_lessonId?.lessonId}`)
}

export const deleteAttendance = async (data: Prisma.AttendanceDeleteArgs) => {
  await prisma.attendance.delete(data)

  revalidatePath(`/dashboard/lessons/${data.where.lessonId}`)
}
