'use server'

import { prisma } from '@/lib/prisma'
import { AttendanceStatus, Prisma } from '@prisma/client'
import { toZonedTime } from 'date-fns-tz'
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
  if (oldStatus === AttendanceStatus.UNSPECIFIED && newStatus !== AttendanceStatus.UNSPECIFIED) {
    await prisma.student.update({
      where: { id: studentId },
      data: { lessonsBalance: { decrement: 1 } },
    })
    return
  }

  if (oldStatus !== AttendanceStatus.UNSPECIFIED && newStatus === AttendanceStatus.UNSPECIFIED) {
    await prisma.student.update({
      where: { id: studentId },
      data: { lessonsBalance: { increment: 1 } },
    })
    return
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

export const updateDataMock = async (time: number) => {
  await new Promise((resolve) => setTimeout(resolve, time))
}

export const deleteAttendance = async (data: Prisma.AttendanceDeleteArgs) => {
  await prisma.attendance.delete(data)

  revalidatePath(`/dashboard/lessons/${data.where.lessonId}`)
}

export const getAbsentStatistics = async () => {
  const absences = await prisma.attendance.findMany({
    where: {
      status: 'ABSENT',
    },
    include: {
      student: true,
      lesson: true,
      missedMakeup: {
        include: {
          makeUpAttendance: true,
        },
      },
    },
    orderBy: {
      lesson: {
        date: 'asc',
      },
    },
  })

  // Calculate student rates
  const payments = await prisma.payment.groupBy({
    by: ['studentId'],
    _sum: {
      price: true,
      lessonCount: true,
    },
    where: {
      lessonCount: { gt: 0 },
      price: { gt: 0 },
    },
  })

  const studentRates = new Map<number, number>()
  let globalTotalMoney = 0
  let globalTotalLessons = 0

  payments.forEach((p) => {
    const price = p._sum.price || 0
    const count = p._sum.lessonCount || 0
    globalTotalMoney += price
    globalTotalLessons += count

    if (count > 0) {
      studentRates.set(p.studentId, price / count)
    }
  })

  const averagePrice =
    globalTotalLessons > 0 ? Math.round(globalTotalMoney / globalTotalLessons) : 0

  // Aggregation
  const monthlyStatsMap = new Map<
    string,
    { missed: number; saved: number; missedMoney: number; savedMoney: number; timestamp: number }
  >()
  const weeklyStatsMap = new Map<
    string,
    { missed: number; saved: number; missedMoney: number; savedMoney: number; timestamp: number }
  >()

  absences.forEach((att) => {
    const date = toZonedTime(new Date(att.lesson.date), 'Europe/Moscow')
    const rate = att.student.totalPayments / att.student.totalLessons || averagePrice

    // Monthly Grouping
    // Key: YYYY-MM
    const y = date.getFullYear()
    const m = date.getMonth()
    const monthKey = `${y}-${String(m + 1).padStart(2, '0')}`

    // Weekly Grouping
    // Get Monday of the week
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
    const monday = new Date(d.setDate(diff))
    monday.setHours(0, 0, 0, 0)
    const weekKey = monday.toISOString().split('T')[0] // YYYY-MM-DD

    // Check saved status
    let isSaved = false
    if (att.missedMakeup?.makeUpAttendance?.status === 'PRESENT') {
      isSaved = true
    }

    // Update Monthly
    if (!monthlyStatsMap.has(monthKey)) {
      monthlyStatsMap.set(monthKey, {
        missed: 0,
        saved: 0,
        missedMoney: 0,
        savedMoney: 0,
        timestamp: new Date(y, m, 1).getTime(),
      })
    }
    const mStat = monthlyStatsMap.get(monthKey)!
    mStat.missed++
    mStat.missedMoney += rate
    if (isSaved) {
      mStat.saved++
      mStat.savedMoney += rate
    }

    // Update Weekly
    if (!weeklyStatsMap.has(weekKey)) {
      weeklyStatsMap.set(weekKey, {
        missed: 0,
        saved: 0,
        missedMoney: 0,
        savedMoney: 0,
        timestamp: monday.getTime(),
      })
    }
    const wStat = weeklyStatsMap.get(weekKey)!
    wStat.missed++
    wStat.missedMoney += rate
    if (isSaved) {
      wStat.saved++
      wStat.savedMoney += rate
    }
  })

  // Format and Sort Monthly
  const monthly = Array.from(monthlyStatsMap.entries())
    .sort((a, b) => a[1].timestamp - b[1].timestamp)
    .map(([key, val]) => {
      const dateRep = new Date(val.timestamp)
      return {
        name: dateRep.toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' }),
        missed: val.missed,
        saved: val.saved,
        missedMoney: Math.round(val.missedMoney),
        savedMoney: Math.round(val.savedMoney),
        lossMoney: Math.round(val.missedMoney - val.savedMoney),
      }
    })

  // Format and Sort Weekly
  const weekly = Array.from(weeklyStatsMap.entries())
    .sort((a, b) => a[1].timestamp - b[1].timestamp)
    .map(([key, val]) => {
      const dateRep = new Date(val.timestamp)
      return {
        name: dateRep.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
        missed: val.missed,
        saved: val.saved,
        missedMoney: Math.round(val.missedMoney),
        savedMoney: Math.round(val.savedMoney),
        lossMoney: Math.round(val.missedMoney - val.savedMoney),
      }
    })

  return { averagePrice, monthly, weekly }
}
