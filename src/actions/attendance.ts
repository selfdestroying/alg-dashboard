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
  return attendance
}

/**
 * Определяет необходимые операции начисления/списания коинов
 * на основе изменения статуса посещаемости.
 */
const getCoinUpdateOperations = (
  newStatus: AttendanceStatus,
  oldStatus: AttendanceStatus,
  studentId: number
): Prisma.PrismaPromise<Student>[] => {
  const coinUpdates: Prisma.PrismaPromise<Student>[] = []

  // Начисление коинов: новый статус PRESENT, а старый не был PRESENT
  if (newStatus === AttendanceStatus.PRESENT && oldStatus !== AttendanceStatus.PRESENT) {
    coinUpdates.push(
      prisma.student.update({
        where: { id: studentId },
        data: { coins: { increment: 10 } },
      })
    )
    console.log(`Начислено 10 коинов студенту ${studentId} за посещение.`)
  }
  // Списание коинов: новый статус НЕ PRESENT, а старый был PRESENT
  else if (newStatus !== AttendanceStatus.PRESENT && oldStatus === AttendanceStatus.PRESENT) {
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
  // Проверяем, что data не пустая и lessonId существует
  if (data.length === 0 || !data[0].lessonId) {
    console.warn('Нет данных для обновления или отсутствует lessonId.')
    return // Или выбросить ошибку
  }

  const updates: Prisma.PrismaPromise<Attendance | Student>[] = []

  // Предварительно получаем все старые статусы посещаемости
  // Это более эффективно, чем делать N запросов findUniqueOrThrow в цикле.
  const oldAttendances = await prisma.attendance.findMany({
    where: {
      id: {
        in: data.map((item) => item.id),
      },
    },
    select: { id: true, status: true, studentId: true },
  })

  // Преобразуем массив в Map для быстрого доступа по ID
  const oldAttendanceMap = new Map(oldAttendances.map((att) => [att.id, att]))

  for (const item of data) {
    const oldAttendance = oldAttendanceMap.get(item.id)

    if (!oldAttendance) {
      console.warn(`Запись о посещении с ID ${item.id} не найдена. Пропускаем.`)
      continue
    }

    // 1. Операция обновления самой записи посещаемости
    updates.push(
      prisma.attendance.update({
        where: { id: item.id },
        data: {
          status: item.status,
          comment: item.comment,
        },
      })
    )

    // 2. Операции для отработки пропущенных занятий
    if (item.asMakeupFor) {
      // Здесь статус отработки тоже обновляется согласно новому статусу текущего посещения
      // Можно рассмотреть, должно ли это также влиять на коины,
      // но в текущей логике коины привязаны только к 'PRESENT' фактического посещения.
      updates.push(
        prisma.attendance.update({
          where: { id: item.asMakeupFor.missedAttendanceId },
          data: {
            status: item.status,
          },
        })
      )
    }

    // 3. Операции начисления/списания коинов, используя вынесенную функцию
    const coinOperations = getCoinUpdateOperations(
      item.status,
      oldAttendance.status,
      oldAttendance.studentId
    )
    updates.push(...coinOperations) // Добавляем все операции с коинами в общий массив
  }

  // Выполняем все собранные операции в одной транзакции
  try {
    await prisma.$transaction(updates)
    console.log('Все обновления посещаемости и операции с коинами выполнены успешно.')
  } catch (error) {
    console.error('Ошибка при выполнении транзакции обновления посещаемости и коинов:', error)
    throw error // Перебрасываем ошибку для обработки на верхнем уровне
  }

  // Ревалидация пути
  revalidatePath(`dashboard/lessons/${data[0].lessonId}`)
}
