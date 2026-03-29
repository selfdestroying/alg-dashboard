'use server'

import prisma from '@/src/lib/db/prisma'
import { authAction } from '@/src/lib/safe-action'
import { AdvancesFiltersSchema } from './schemas'
import type { AdvancesData, AdvanceTotals, StudentAdvanceRow } from './types'

/** Определяет, списывается ли занятие (логика из revenue) */
function isChargeable(att: {
  status: string
  isWarned: boolean | null
  makeupAttendance?: { status: string } | null
}): boolean {
  if (att.status === 'PRESENT') return true
  if (att.status === 'ABSENT' && !att.isWarned) return true
  if (att.status === 'ABSENT' && att.isWarned) {
    return att.makeupAttendance?.status === 'PRESENT'
  }
  return false
}

export const getAdvancesData = authAction
  .metadata({ actionName: 'getAdvancesData' })
  .inputSchema(AdvancesFiltersSchema)
  .action(async ({ ctx, parsedInput }): Promise<AdvancesData> => {
    const { startDate, endDate } = parsedInput
    const organizationId = ctx.session.organizationId!

    const periodStart = new Date(startDate)
    const periodEnd = new Date(endDate)
    // Сдвигаем конец на +1 день чтобы включить последний день
    const periodEndExclusive = new Date(periodEnd)
    periodEndExclusive.setDate(periodEndExclusive.getDate() + 1)

    // ====================================================================
    // 1. ВСЕ оплаты организации ДО конца периода
    // ====================================================================
    const allPayments = await prisma.payment.findMany({
      where: { organizationId, createdAt: { lt: periodEndExclusive } },
      select: {
        id: true,
        studentId: true,
        price: true,
        lessonCount: true,
        createdAt: true,
        student: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    // ====================================================================
    // 2. ВСЕ посещения организации ДО конца периода
    // ====================================================================
    const allAttendances = await prisma.attendance.findMany({
      where: {
        organizationId,
        makeupForAttendanceId: null,
        lesson: { date: { lt: periodEndExclusive }, status: 'ACTIVE' },
      },
      select: {
        id: true,
        studentId: true,
        student: true,
        status: true,
        isWarned: true,
        lesson: { select: { date: true } },
        makeupAttendance: { select: { status: true } },
      },
      orderBy: { lesson: { date: 'asc' } },
    })

    // ====================================================================
    // 3. Группируем по студенту
    // ====================================================================
    const paymentsByStudent = Map.groupBy(allPayments, (p) => p.studentId)
    const attendancesByStudent = Map.groupBy(allAttendances, (a) => a.studentId)

    // Собираем уникальных студентов
    const studentMap = new Map<number, { id: number; firstName: string; lastName: string }>()
    for (const p of allPayments) {
      if (!studentMap.has(p.studentId)) studentMap.set(p.studentId, p.student)
    }
    for (const a of allAttendances) {
      if (!studentMap.has(a.studentId))
        studentMap.set(a.studentId, {
          id: a.studentId,
          firstName: a.student.firstName,
          lastName: a.student.lastName,
        })
    }

    // ====================================================================
    // 4. Считаем по каждому студенту
    // ====================================================================
    const studentRows: StudentAdvanceRow[] = []

    for (const [studentId, student] of studentMap) {
      const payments = paymentsByStudent.get(studentId) ?? []
      const attendances = attendancesByStudent.get(studentId) ?? []

      const totalPaid = payments.reduce((s, p) => s + p.price, 0)
      const totalLessonsPaid = payments.reduce((s, p) => s + p.lessonCount, 0)
      const avgCost = totalLessonsPaid > 0 ? totalPaid / totalLessonsPaid : 0

      const pmtBefore = payments.filter((p) => p.createdAt < periodStart)
      const pmtIn = payments.filter(
        (p) => p.createdAt >= periodStart && p.createdAt < periodEndExclusive,
      )
      const paidBefore = pmtBefore.reduce((s, p) => s + p.price, 0)
      const paidInPeriod = pmtIn.reduce((s, p) => s + p.price, 0)

      const attBefore = attendances.filter((a) => a.lesson.date < periodStart)
      const chargedBeforeCount = attBefore.filter((a) => isChargeable(a)).length
      const revenueBefore = chargedBeforeCount * avgCost
      const advanceAtStart = paidBefore - revenueBefore

      const attIn = attendances.filter(
        (a) => a.lesson.date >= periodStart && a.lesson.date < periodEndExclusive,
      )
      const chargedInPeriodCount = attIn.filter((a) => isChargeable(a)).length
      const revenueInPeriod = chargedInPeriodCount * avgCost
      const advanceAtEnd = advanceAtStart + paidInPeriod - revenueInPeriod

      studentRows.push({
        id: studentId,
        name: `${student.lastName} ${student.firstName}`.trim(),
        totalPaid,
        totalLessonsPaid,
        avgCostPerLesson: avgCost,
        paidBefore,
        paidInPeriod,
        chargedBeforeCount,
        revenueBefore,
        advanceAtStart,
        chargedInPeriodCount,
        revenueInPeriod,
        advanceAtEnd,
        totalAttendancesInPeriod: attIn.length,
      })
    }

    // Сортируем: сначала с наибольшим авансом
    studentRows.sort((a, b) => b.advanceAtEnd - a.advanceAtEnd)

    // Фильтруем студентов без активности
    const activeRows = studentRows.filter(
      (r) =>
        r.paidBefore !== 0 ||
        r.paidInPeriod !== 0 ||
        r.totalAttendancesInPeriod !== 0 ||
        r.advanceAtStart !== 0,
    )

    // ====================================================================
    // 5. Итоги по всей школе
    // ====================================================================
    const totals: AdvanceTotals = activeRows.reduce(
      (acc, r) => ({
        totalPaid: acc.totalPaid + r.totalPaid,
        advanceAtStart: acc.advanceAtStart + r.advanceAtStart,
        paidInPeriod: acc.paidInPeriod + r.paidInPeriod,
        revenueInPeriod: acc.revenueInPeriod + r.revenueInPeriod,
        advanceAtEnd: acc.advanceAtEnd + r.advanceAtEnd,
        chargedInPeriod: acc.chargedInPeriod + r.chargedInPeriodCount,
        totalAttendances: acc.totalAttendances + r.totalAttendancesInPeriod,
      }),
      {
        totalPaid: 0,
        advanceAtStart: 0,
        paidInPeriod: 0,
        revenueInPeriod: 0,
        advanceAtEnd: 0,
        chargedInPeriod: 0,
        totalAttendances: 0,
      },
    )

    return {
      students: activeRows,
      totals,
      periodLabel: `${periodStart.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })} - ${periodEnd.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    }
  })
