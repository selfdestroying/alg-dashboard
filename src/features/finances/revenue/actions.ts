'use server'

import prisma from '@/src/lib/db/prisma'
import { authAction } from '@/src/lib/safe-action'
import { RevenueFiltersSchema } from './schemas'
import type {
  AttendanceWithCost,
  DayGroup,
  LessonWithCost,
  RevenueData,
  RevenueStats,
} from './types'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value)
}

export const getRevenueData = authAction
  .metadata({ actionName: 'getRevenueData' })
  .inputSchema(RevenueFiltersSchema)
  .action(async ({ ctx, parsedInput }): Promise<RevenueData> => {
    const { startDate, endDate, courseIds, locationIds, teacherIds } = parsedInput
    const organizationId = ctx.session.organizationId!

    // Build dynamic group filter
    const groupFilter: Record<string, object> = {}
    if (courseIds && courseIds.length > 0) {
      groupFilter.courseId = { in: courseIds }
    }
    if (locationIds && locationIds.length > 0) {
      groupFilter.locationId = { in: locationIds }
    }

    // Build teacher filter
    const teacherFilter =
      teacherIds && teacherIds.length > 0 ? { some: { teacherId: { in: teacherIds } } } : undefined

    const lessons = await prisma.lesson.findMany({
      where: {
        organizationId,
        date: { gte: startDate, lte: endDate },
        group: Object.keys(groupFilter).length > 0 ? groupFilter : undefined,
        teachers: teacherFilter,
      },
      select: {
        id: true,
        date: true,
        time: true,
        status: true,
        group: {
          select: {
            id: true,
            course: { select: { name: true } },
            location: { select: { name: true } },
            groupType: { select: { name: true } },
            schedules: { select: { dayOfWeek: true, time: true } },
            teachers: { select: { teacher: { select: { name: true } } } },
          },
        },
        attendance: {
          where: { makeupForAttendanceId: null },
          select: {
            makeupAttendance: {
              select: {
                status: true,
                lesson: {
                  select: {
                    date: true,
                    group: { select: { course: { select: { name: true } } } },
                  },
                },
              },
            },
            isWarned: true,
            status: true,
            studentStatus: true,
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                wallets: {
                  select: {
                    id: true,
                    name: true,
                    lessonsBalance: true,
                    totalLessons: true,
                    totalPayments: true,
                    studentGroups: { select: { groupId: true, studentId: true } },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
    })

    // --- Compute stats ---
    const totalLessons = lessons.length
    let doneLessons = 0
    let presentCount = 0
    let totalStudentVisits = 0
    let totalRevenue = 0
    let chargedVisits = 0

    // --- Compute per-lesson cost + build day groups ---
    const dayMap: Record<string, DayGroup> = {}

    for (const lesson of lessons) {
      const isActive = lesson.status === 'ACTIVE'
      if (isActive) doneLessons++

      const attendanceWithCost: AttendanceWithCost[] = lesson.attendance.map((att) => {
        const wallet = att.student.wallets.find((w) =>
          w.studentGroups.some((sg) => sg.groupId === lesson.group.id),
        )

        let costReason: string
        let visitCost = 0

        if (lesson.status === 'CANCELLED') {
          costReason = 'Урок отменён — стоимость не списывается'
        } else if (!wallet) {
          costReason = 'Кошелёк не привязан к этой группе'
        } else if (wallet.totalLessons <= 0) {
          costReason = 'В кошельке 0 уроков — невозможно рассчитать стоимость'
        } else if (att.status === 'PRESENT') {
          visitCost = wallet.totalPayments / wallet.totalLessons
          costReason = `Присутствовал → списано\n${formatCurrency(wallet.totalPayments)} / ${wallet.totalLessons} ур. = ${formatCurrency(visitCost)}`
        } else if (att.status === 'ABSENT' && !att.isWarned) {
          visitCost = wallet.totalPayments / wallet.totalLessons
          costReason = `Отсутствовал без предупреждения → списано\n${formatCurrency(wallet.totalPayments)} / ${wallet.totalLessons} ур. = ${formatCurrency(visitCost)}`
        } else if (att.status === 'ABSENT' && att.isWarned) {
          if (att.makeupAttendance && att.makeupAttendance.status === 'PRESENT') {
            visitCost = wallet.totalPayments / wallet.totalLessons
            costReason = `Предупредил, но отработка засчитана → списано\n${formatCurrency(wallet.totalPayments)} / ${wallet.totalLessons} ур. = ${formatCurrency(visitCost)}`
          } else if (att.makeupAttendance && att.makeupAttendance.status !== 'PRESENT') {
            costReason = 'Предупредил, отработка не засчитана → не списано'
          } else {
            costReason = 'Предупредил об отсутствии → не списано'
          }
        } else if (att.status === 'UNSPECIFIED') {
          costReason = 'Статус посещения не указан → не списано'
        } else {
          costReason = 'Не подлежит списанию'
        }

        // Stats accumulation (only for active lessons)
        if (isActive) {
          totalStudentVisits++
          if (att.status === 'PRESENT') presentCount++
          if (visitCost > 0) {
            totalRevenue += visitCost
            chargedVisits++
          }
        }

        return {
          status: att.status,
          isWarned: att.isWarned,
          studentStatus: att.studentStatus,
          visitCost,
          costReason,
          student: {
            id: att.student.id,
            firstName: att.student.firstName,
            lastName: att.student.lastName,
          },
          wallet: wallet
            ? {
                id: wallet.id,
                name: wallet.name,
                lessonsBalance: wallet.lessonsBalance,
                totalLessons: wallet.totalLessons,
                totalPayments: wallet.totalPayments,
              }
            : null,
          makeupAttendance: att.makeupAttendance
            ? {
                status: att.makeupAttendance.status,
                lesson: att.makeupAttendance.lesson,
              }
            : null,
        }
      })

      const dayOfWeek = lesson.date.toLocaleDateString('ru-RU', { weekday: 'long' })
      const dateKey = lesson.date.toISOString().split('T')[0]!

      const lessonWithCost: LessonWithCost = {
        id: lesson.id,
        date: lesson.date,
        time: lesson.time,
        status: lesson.status,
        dayOfWeek,
        group: lesson.group,
        attendance: attendanceWithCost,
      }

      if (!dayMap[dateKey]) {
        dayMap[dateKey] = {
          date: lesson.date,
          dayOfWeek,
          dayRevenue: 0,
          lessons: [],
        }
      }
      dayMap[dateKey].lessons.push(lessonWithCost)
      dayMap[dateKey].dayRevenue += attendanceWithCost.reduce((s, a) => s + a.visitCost, 0)
    }

    const attendanceRate =
      totalStudentVisits > 0 ? Math.round((presentCount / totalStudentVisits) * 100) : 0
    const avgPerVisit = chargedVisits > 0 ? totalRevenue / chargedVisits : 0
    const avgPerLesson = doneLessons > 0 ? totalRevenue / doneLessons : 0

    const stats: RevenueStats = {
      totalLessons,
      doneLessons,
      presentCount,
      totalStudentVisits,
      attendanceRate,
      totalRevenue,
      chargedVisits,
      avgPerVisit,
      avgPerLesson,
    }

    const days = Object.values(dayMap).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )

    return { stats, days }
  })
