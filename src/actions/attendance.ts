'use server'

import prisma from '@/lib/prisma'
import { AttendanceStatus, Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export type AttendanceWithStudents = Prisma.AttendanceGetPayload<{
  include: {
    student: true
    lesson: {
      include: {
        group: true
      }
    }
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

const updateLessonsBalance = async (
  newStatus: AttendanceStatus,
  oldStatus: AttendanceStatus,
  studentId: number
) => {
  if (newStatus === AttendanceStatus.PRESENT && oldStatus !== AttendanceStatus.PRESENT) {
    await prisma.student.update({
      where: { id: studentId },
      data: { lessonsBalance: { decrement: 1 } },
    })
  } else if (newStatus !== AttendanceStatus.PRESENT && oldStatus === AttendanceStatus.PRESENT) {
    await prisma.student.update({
      where: { id: studentId },
      data: { lessonsBalance: { increment: 1 } },
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
      if (oldAttendance.studentStatus !== 'TRIAL') {
        await updateCoins(status as AttendanceStatus, oldAttendance.status, oldAttendance.studentId)
        await updateLessonsBalance(
          status as AttendanceStatus,
          oldAttendance.status,
          oldAttendance.studentId
        )
      }
    }
  }
  await prisma.attendance.update(payload)
  revalidatePath(`/dashboard/lessons/${payload.where.studentId_lessonId?.lessonId}`)
}

export const updateAttendanceComment = async (payload: Prisma.AttendanceUpdateArgs) => {
  await prisma.attendance.update(payload)
}

export const updateDataMock = async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000))
}

export const deleteAttendance = async (data: Prisma.AttendanceDeleteArgs) => {
  await prisma.attendance.delete(data)

  revalidatePath(`/dashboard/lessons/${data.where.lessonId}`)
}
