'use server'

import prisma from '@/lib/prisma'
import { Attendance, AttendanceStatus, Prisma, Student } from '@prisma/client'
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

const getCoinUpdateOperations = (
  newStatus: AttendanceStatus,
  oldStatus: AttendanceStatus,
  studentId: number
): Prisma.PrismaPromise<Student>[] => {
  const coinUpdates: Prisma.PrismaPromise<Student>[] = []

  if (newStatus === AttendanceStatus.PRESENT && oldStatus !== AttendanceStatus.PRESENT) {
    coinUpdates.push(
      prisma.student.update({
        where: { id: studentId },
        data: { coins: { increment: 10 } },
      })
    )
    console.log(`Начислено 10 коинов студенту ${studentId} за посещение.`)
  } else if (newStatus !== AttendanceStatus.PRESENT && oldStatus === AttendanceStatus.PRESENT) {
    coinUpdates.push(
      prisma.student.update({
        where: { id: studentId },
        data: { coins: { decrement: 10 } },
      })
    )
    console.log(`Списано 10 коинов у студента ${studentId} из-за изменения статуса с PRESENT.`)
  }

  return coinUpdates
}

export const updateAttendance = async (data: AttendanceWithStudents[]) => {
  if (data.length === 0 || !data[0].lessonId) {
    console.warn('Нет данных для обновления или отсутствует lessonId.')
    return
  }

  const updates: Prisma.PrismaPromise<Attendance | Student>[] = []

  const oldAttendances = await prisma.attendance.findMany({
    where: {
      id: {
        in: data.map((item) => item.id),
      },
    },
    select: { id: true, status: true, studentId: true },
  })

  const oldAttendanceMap = new Map(oldAttendances.map((att) => [att.id, att]))

  for (const item of data) {
    const oldAttendance = oldAttendanceMap.get(item.id)

    if (!oldAttendance) {
      console.warn(`Запись о посещении с ID ${item.id} не найдена. Пропускаем.`)
      continue
    }

    updates.push(
      prisma.attendance.update({
        where: { id: item.id },
        data: {
          status: item.status,
          comment: item.comment,
        },
      })
    )

    // if (item.asMakeupFor) {
    //   updates.push(
    //     prisma.attendance.update({
    //       where: { id: item.asMakeupFor.missedAttendanceId },
    //       data: {
    //         status: item.status,
    //       },
    //     })
    //   )
    // }

    const coinOperations = getCoinUpdateOperations(
      item.status,
      oldAttendance.status,
      oldAttendance.studentId
    )
    updates.push(...coinOperations)
  }

  try {
    await prisma.$transaction(updates)
    console.log('Все обновления посещаемости и операции с коинами выполнены успешно.')
  } catch (error) {
    console.error('Ошибка при выполнении транзакции обновления посещаемости и коинов:', error)
    throw error
  }

  revalidatePath(`dashboard/lessons/${data[0].lessonId}`)
}

export const deleteAttendance = async (data: Prisma.AttendanceDeleteArgs) => {
  await prisma.attendance.delete(data)

  revalidatePath(`dashboard/lessons/${data.where.lessonId}`)
}
