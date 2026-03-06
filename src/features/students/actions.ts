'use server'

import { Prisma } from '@/prisma/generated/client'
import { StudentFinancialField, StudentLessonsBalanceChangeReason } from '@/prisma/generated/enums'
import prisma from '@/src/lib/db/prisma'
import {
  type StudentFinancialAudit,
  FINANCIAL_FIELD_KEY,
  parseIntFieldChange,
  writeFinancialHistoryTx,
} from '@/src/lib/lessons-balance'
import { authAction } from '@/src/lib/safe-action'
import { moscowNow, toMoscow } from '@/src/lib/timezone'
import * as z from 'zod'
import { CreateStudentSchema, DeleteStudentSchema } from './schemas'

// ─── READ ────────────────────────────────────────────────────────────────────

export const getStudents = authAction
  .metadata({ actionName: 'getStudents' })
  .action(async ({ ctx }) => {
    return await prisma.student.findMany({
      where: { organizationId: ctx.session.organizationId! },
      include: { groups: true },
      orderBy: { id: 'asc' },
    })
  })

export const getStudent = authAction
  .metadata({ actionName: 'getStudent' })
  .inputSchema(
    z.object({
      id: z.number().int().positive(),
      include: z.any().optional(),
    }),
  )
  .action(async ({ ctx, parsedInput }) => {
    return await prisma.student.findFirst({
      where: { id: parsedInput.id, organizationId: ctx.session.organizationId! },
      include: parsedInput.include,
    })
  })

// ─── CREATE ──────────────────────────────────────────────────────────────────

export const createStudent = authAction
  .metadata({ actionName: 'createStudent' })
  .inputSchema(CreateStudentSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { birthDate, ...rest } = parsedInput
    const age =
      new Date().getFullYear() -
      birthDate.getFullYear() -
      (new Date() < new Date(new Date().getFullYear(), birthDate.getMonth(), birthDate.getDate())
        ? 1
        : 0)

    await prisma.student.create({
      data: {
        ...rest,
        birthDate,
        age,
        organizationId: ctx.session.organizationId!,
        cart: { create: {} },
      },
    })
  })

// ─── UPDATE ──────────────────────────────────────────────────────────────────

export const updateStudent = authAction
  .metadata({ actionName: 'updateStudent' })
  .inputSchema(
    z.object({
      payload: z.any(),
      audit: z.any().optional(),
    }),
  )
  .action(async ({ ctx, parsedInput }) => {
    const payload = parsedInput.payload as Prisma.StudentUpdateArgs
    const audit = parsedInput.audit as StudentFinancialAudit | undefined
    const data = payload.data as Prisma.StudentUpdateInput | undefined

    const financialFields = [
      StudentFinancialField.LESSONS_BALANCE,
      StudentFinancialField.TOTAL_PAYMENTS,
      StudentFinancialField.TOTAL_LESSONS,
    ] as const

    const changes = financialFields
      .map((field) => {
        const key = FINANCIAL_FIELD_KEY[field]
        const change = parseIntFieldChange(data?.[key])
        return change ? { field, key, change } : null
      })
      .filter(Boolean) as {
      field: StudentFinancialField
      key: 'lessonsBalance' | 'totalPayments' | 'totalLessons'
      change: NonNullable<ReturnType<typeof parseIntFieldChange>>
    }[]

    const studentId = payload.where.id
    if (!studentId) {
      await prisma.student.update(payload)
      return
    }

    if (changes.length === 0) {
      await prisma.student.update(payload)
      return
    }

    for (const c of changes) {
      if (!audit?.[c.field]) {
        throw new Error(`Для изменения поля ${c.key} требуется указать причину (audit.${c.field})`)
      }
    }

    await prisma.$transaction(async (tx) => {
      const student = await tx.student.findUnique({
        where: { id: studentId },
        select: { lessonsBalance: true, totalPayments: true, totalLessons: true },
      })

      if (!student) throw new Error('Ученик не найден')

      const updated = await tx.student.update({
        where: { id: studentId },
        data: payload.data as Prisma.StudentUpdateInput,
        select: { lessonsBalance: true, totalPayments: true, totalLessons: true },
      })

      for (const c of changes) {
        const fieldAudit = audit![c.field]!
        const balanceBefore = student[c.key]
        const balanceAfter = updated[c.key]
        const delta = balanceAfter - balanceBefore

        await writeFinancialHistoryTx(tx, {
          organizationId: ctx.session.organizationId!,
          studentId,
          actorUserId: Number(ctx.session.user.id),
          field: c.field,
          reason: fieldAudit.reason,
          delta,
          balanceBefore,
          balanceAfter,
          comment: fieldAudit.comment,
          meta: fieldAudit.meta,
        })
      }
    })
  })

// ─── DELETE ──────────────────────────────────────────────────────────────────

export const deleteStudent = authAction
  .metadata({ actionName: 'deleteStudent' })
  .inputSchema(DeleteStudentSchema)
  .action(async ({ ctx, parsedInput }) => {
    await prisma.student.delete({
      where: { id: parsedInput.id, organizationId: ctx.session.organizationId! },
    })
  })

// ─── STUDENT GROUP BALANCE ───────────────────────────────────────────────────

export const updateStudentGroupBalance = authAction
  .metadata({ actionName: 'updateStudentGroupBalance' })
  .inputSchema(
    z.object({
      studentId: z.number().int().positive(),
      groupId: z.number().int().positive(),
      data: z.any(),
      audit: z.any(),
      payment: z
        .object({
          lessonCount: z.number(),
          price: z.number(),
          bidForLesson: z.number(),
          leadName: z.string(),
          productName: z.string(),
        })
        .optional(),
    }),
  )
  .action(async ({ ctx, parsedInput }) => {
    const { studentId, groupId, payment } = parsedInput
    const data = parsedInput.data as {
      lessonsBalance?: Prisma.IntFieldUpdateOperationsInput | number
      totalLessons?: Prisma.IntFieldUpdateOperationsInput | number
      totalPayments?: Prisma.IntFieldUpdateOperationsInput | number
    }
    const audit = parsedInput.audit as StudentFinancialAudit

    const financialFields = [
      StudentFinancialField.LESSONS_BALANCE,
      StudentFinancialField.TOTAL_PAYMENTS,
      StudentFinancialField.TOTAL_LESSONS,
    ] as const

    const changes = financialFields
      .map((field) => {
        const key = FINANCIAL_FIELD_KEY[field]
        const change = parseIntFieldChange(data[key] as Prisma.StudentUpdateInput['lessonsBalance'])
        return change ? { field, key, change } : null
      })
      .filter(Boolean) as {
      field: StudentFinancialField
      key: 'lessonsBalance' | 'totalPayments' | 'totalLessons'
      change: NonNullable<ReturnType<typeof parseIntFieldChange>>
    }[]

    if (changes.length === 0) return

    for (const c of changes) {
      if (!audit[c.field]) {
        throw new Error(`Для изменения поля ${c.key} требуется указать причину (audit.${c.field})`)
      }
    }

    await prisma.$transaction(async (tx) => {
      const sg = await tx.studentGroup.findUnique({
        where: { studentId_groupId: { studentId, groupId } },
        select: {
          lessonsBalance: true,
          totalPayments: true,
          totalLessons: true,
          organizationId: true,
        },
      })
      if (!sg) throw new Error('Ученик не найден в группе')

      if (payment) {
        await tx.payment.create({
          data: {
            organizationId: sg.organizationId,
            studentId,
            groupId,
            lessonCount: payment.lessonCount,
            price: payment.price,
            bidForLesson: payment.bidForLesson,
            leadName: payment.leadName,
            productName: payment.productName,
          },
        })
      }

      const updated = await tx.studentGroup.update({
        where: { studentId_groupId: { studentId, groupId } },
        data,
        select: { lessonsBalance: true, totalPayments: true, totalLessons: true },
      })

      for (const c of changes) {
        const fieldAudit = audit[c.field]!
        const balanceBefore = sg[c.key]
        const balanceAfter = updated[c.key]
        const delta = balanceAfter - balanceBefore

        await writeFinancialHistoryTx(tx, {
          organizationId: ctx.session.organizationId!,
          studentId,
          actorUserId: Number(ctx.session.user.id),
          groupId,
          field: c.field,
          reason: fieldAudit.reason,
          delta,
          balanceBefore,
          balanceAfter,
          comment: fieldAudit.comment,
          meta: fieldAudit.meta,
        })
      }
    })
  })

// ─── REDISTRIBUTE BALANCE ────────────────────────────────────────────────────

export const redistributeBalance = authAction
  .metadata({ actionName: 'redistributeBalance' })
  .inputSchema(
    z.object({
      studentId: z.number().int().positive(),
      allocations: z.array(
        z.object({
          groupId: z.number().int().positive(),
          lessons: z.number().optional(),
          totalLessons: z.number().optional(),
          totalPayments: z.number().optional(),
        }),
      ),
    }),
  )
  .action(async ({ ctx, parsedInput }) => {
    const { studentId, allocations } = parsedInput

    const sumLessons = allocations.reduce((sum, a) => sum + (a.lessons ?? 0), 0)
    const sumTotalLessons = allocations.reduce((sum, a) => sum + (a.totalLessons ?? 0), 0)
    const sumTotalPayments = allocations.reduce((sum, a) => sum + (a.totalPayments ?? 0), 0)

    await prisma.$transaction(async (tx) => {
      const student = await tx.student.findUnique({
        where: { id: studentId },
        select: { lessonsBalance: true, totalLessons: true, totalPayments: true },
      })
      if (!student) throw new Error('Ученик не найден')

      if (sumLessons > student.lessonsBalance) {
        throw new Error(
          `Невозможно распределить ${sumLessons} ур. Нераспределённый остаток: ${student.lessonsBalance}`,
        )
      }
      if (sumTotalLessons > student.totalLessons) {
        throw new Error(
          `Невозможно распределить ${sumTotalLessons} всего уроков. Нераспределённый остаток: ${student.totalLessons}`,
        )
      }
      if (sumTotalPayments > student.totalPayments) {
        throw new Error(
          `Невозможно распределить ${sumTotalPayments} ₽. Нераспределённый остаток: ${student.totalPayments}`,
        )
      }

      for (const alloc of allocations) {
        const hasLessons = (alloc.lessons ?? 0) > 0
        const hasTotalLessons = (alloc.totalLessons ?? 0) > 0
        const hasTotalPayments = (alloc.totalPayments ?? 0) > 0
        if (!hasLessons && !hasTotalLessons && !hasTotalPayments) continue

        const sg = await tx.studentGroup.findUnique({
          where: { studentId_groupId: { studentId, groupId: alloc.groupId } },
          select: { lessonsBalance: true, totalLessons: true, totalPayments: true },
        })
        if (!sg) throw new Error(`Ученик не состоит в группе ${alloc.groupId}`)

        const updateData: Prisma.StudentGroupUpdateInput = {}
        const decrementStudent: Prisma.StudentUpdateInput = {}

        if (hasLessons) {
          updateData.lessonsBalance = { increment: alloc.lessons! }
          decrementStudent.lessonsBalance = { decrement: alloc.lessons! }
        }
        if (hasTotalLessons) {
          updateData.totalLessons = { increment: alloc.totalLessons! }
          decrementStudent.totalLessons = { decrement: alloc.totalLessons! }
        }
        if (hasTotalPayments) {
          updateData.totalPayments = { increment: alloc.totalPayments! }
          decrementStudent.totalPayments = { decrement: alloc.totalPayments! }
        }

        const updated = await tx.studentGroup.update({
          where: { studentId_groupId: { studentId, groupId: alloc.groupId } },
          data: updateData,
          select: { lessonsBalance: true, totalLessons: true, totalPayments: true },
        })

        await tx.student.update({
          where: { id: studentId },
          data: decrementStudent,
        })

        if (hasLessons) {
          await writeFinancialHistoryTx(tx, {
            organizationId: ctx.session.organizationId!,
            studentId,
            actorUserId: Number(ctx.session.user.id),
            groupId: alloc.groupId,
            field: StudentFinancialField.LESSONS_BALANCE,
            reason: StudentLessonsBalanceChangeReason.BALANCE_REDISTRIBUTED,
            delta: alloc.lessons!,
            balanceBefore: sg.lessonsBalance,
            balanceAfter: updated.lessonsBalance,
            comment: 'Распределение баланса уроков по группам',
          })
        }
        if (hasTotalLessons) {
          await writeFinancialHistoryTx(tx, {
            organizationId: ctx.session.organizationId!,
            studentId,
            actorUserId: Number(ctx.session.user.id),
            groupId: alloc.groupId,
            field: StudentFinancialField.TOTAL_LESSONS,
            reason: StudentLessonsBalanceChangeReason.BALANCE_REDISTRIBUTED,
            delta: alloc.totalLessons!,
            balanceBefore: sg.totalLessons,
            balanceAfter: updated.totalLessons,
            comment: 'Распределение всего уроков по группам',
          })
        }
        if (hasTotalPayments) {
          await writeFinancialHistoryTx(tx, {
            organizationId: ctx.session.organizationId!,
            studentId,
            actorUserId: Number(ctx.session.user.id),
            groupId: alloc.groupId,
            field: StudentFinancialField.TOTAL_PAYMENTS,
            reason: StudentLessonsBalanceChangeReason.BALANCE_REDISTRIBUTED,
            delta: alloc.totalPayments!,
            balanceBefore: sg.totalPayments,
            balanceAfter: updated.totalPayments,
            comment: 'Распределение суммы оплат по группам',
          })
        }
      }
    })
  })

// ─── BALANCE HISTORY ─────────────────────────────────────────────────────────

export const getStudentLessonsBalanceHistory = authAction
  .metadata({ actionName: 'getStudentLessonsBalanceHistory' })
  .inputSchema(
    z.object({
      studentId: z.number().int().positive(),
      take: z.number().int().positive().optional().default(50),
      groupId: z.number().int().positive().optional(),
    }),
  )
  .action(async ({ parsedInput }) => {
    return await prisma.studentLessonsBalanceHistory.findMany({
      where: {
        studentId: parsedInput.studentId,
        ...(parsedInput.groupId != null ? { groupId: parsedInput.groupId } : {}),
      },
      take: parsedInput.take,
      orderBy: { createdAt: 'desc' },
      include: {
        actorUser: true,
        group: { include: { course: true, location: true } },
      },
    })
  })

export const updateStudentBalanceHistory = authAction
  .metadata({ actionName: 'updateStudentBalanceHistory' })
  .inputSchema(
    z.object({
      id: z.number().int().positive(),
      data: z.any(),
    }),
  )
  .action(async ({ parsedInput }) => {
    return await prisma.studentLessonsBalanceHistory.update({
      where: { id: parsedInput.id },
      data: parsedInput.data as Prisma.StudentLessonsBalanceHistoryUpdateInput,
    })
  })

// ─── GROUP HISTORY ───────────────────────────────────────────────────────────

export type StudentGroupHistoryEntry = {
  type: 'joined' | 'dismissed'
  date: Date
  groupId: number
  groupName: string
  status?: string
}

const DaysShort: Record<number, string> = {
  1: 'Пн',
  2: 'Вт',
  3: 'Ср',
  4: 'Чт',
  5: 'Пт',
  6: 'Сб',
  0: 'Вс',
}

export const getStudentGroupHistory = authAction
  .metadata({ actionName: 'getStudentGroupHistory' })
  .inputSchema(
    z.object({
      studentId: z.number().int().positive(),
    }),
  )
  .action(async ({ ctx, parsedInput }): Promise<StudentGroupHistoryEntry[]> => {
    const { studentId } = parsedInput
    const organizationId = ctx.session.organizationId!

    const [attendances, currentGroups] = await Promise.all([
      prisma.attendance.findMany({
        where: {
          studentId,
          organizationId,
          asMakeupFor: null,
        },
        include: {
          lesson: {
            include: {
              group: {
                include: {
                  course: true,
                  location: true,
                  schedules: true,
                },
              },
            },
          },
        },
        orderBy: { lesson: { date: 'asc' } },
      }),
      prisma.studentGroup.findMany({
        where: { studentId, organizationId },
        select: { groupId: true, status: true },
      }),
    ])

    const currentGroupMap = new Map(currentGroups.map((sg) => [sg.groupId, sg.status]))

    const groupStats = new Map<
      number,
      {
        firstDate: Date
        lastDate: Date
        group: (typeof attendances)[number]['lesson']['group']
      }
    >()

    for (const att of attendances) {
      const gId = att.lesson.groupId
      const date = att.lesson.date
      const existing = groupStats.get(gId)
      if (!existing) {
        groupStats.set(gId, { firstDate: date, lastDate: date, group: att.lesson.group })
      } else {
        if (date < existing.firstDate) existing.firstDate = date
        if (date > existing.lastDate) existing.lastDate = date
      }
    }

    function buildGroupName(g: (typeof attendances)[number]['lesson']['group']) {
      const schedules = g.schedules
      if (schedules && schedules.length > 0) {
        const sorted = [...schedules].sort(
          (a, b) => ((a.dayOfWeek + 6) % 7) - ((b.dayOfWeek + 6) % 7),
        )
        const parts = sorted.map((s) => `${DaysShort[s.dayOfWeek]} ${s.time}`)
        return `${g.course.name} ${parts.join(', ')}`
      }
      return `${g.course.name} ${DaysShort[g.dayOfWeek]} ${g.time}`
    }

    const entries: StudentGroupHistoryEntry[] = []

    for (const [groupId, stats] of groupStats) {
      const name = buildGroupName(stats.group)

      entries.push({
        type: 'joined',
        date: stats.firstDate,
        groupId,
        groupName: name,
        status: currentGroupMap.get(groupId) ?? undefined,
      })

      if (!currentGroupMap.has(groupId)) {
        entries.push({
          type: 'dismissed',
          date: stats.lastDate,
          groupId,
          groupName: name,
        })
      }
    }

    entries.sort((a, b) => b.date.getTime() - a.date.getTime())

    return entries
  })

// ─── STATISTICS ──────────────────────────────────────────────────────────────

export const getActiveStudentStatistics = authAction
  .metadata({ actionName: 'getActiveStudentStatistics' })
  .action(async ({ ctx }) => {
    const organizationId = ctx.session.organizationId!

    const activeStudentGroups = await prisma.studentGroup.findMany({
      where: { organizationId },
      include: {
        group: {
          include: {
            course: true,
            location: true,
            teachers: {
              include: {
                teacher: true,
              },
            },
          },
        },
        student: true,
      },
      orderBy: {
        student: {
          createdAt: 'asc',
        },
      },
    })

    const uniqueStudentsMap = new Map<number, (typeof activeStudentGroups)[0]['student']>()
    activeStudentGroups.forEach((sg) => {
      uniqueStudentsMap.set(sg.student.id, sg.student)
    })

    const totalStudents = uniqueStudentsMap.size

    const monthlyStatsMap = new Map<string, { count: number; timestamp: number }>()
    uniqueStudentsMap.forEach((student) => {
      const date = toMoscow(student.createdAt)
      const y = date.getFullYear()
      const m = date.getMonth()
      const key = `${y}-${String(m + 1).padStart(2, '0')}`
      const existing = monthlyStatsMap.get(key)
      if (existing) {
        existing.count++
      } else {
        monthlyStatsMap.set(key, { count: 1, timestamp: new Date(y, m, 1).getTime() })
      }
    })

    const monthly = Array.from(monthlyStatsMap.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
      .map(([, val]) => {
        const d = new Date(val.timestamp)
        return {
          month: d.toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' }),
          count: val.count,
        }
      })

    const now = moscowNow()
    const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const prevMonthKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`
    const newThisMonth = monthlyStatsMap.get(thisMonthKey)?.count ?? 0
    const newPrevMonth = monthlyStatsMap.get(prevMonthKey)?.count ?? 0
    const growthPercent =
      newPrevMonth > 0 ? Math.round(((newThisMonth - newPrevMonth) / newPrevMonth) * 100) : 0

    const locationStats: Record<string, Set<number>> = {}
    activeStudentGroups.forEach((sg) => {
      const locName = sg.group.location?.name || 'Не указано'
      if (!locationStats[locName]) locationStats[locName] = new Set()
      locationStats[locName].add(sg.studentId)
    })
    const locations = Object.entries(locationStats)
      .map(([name, s]) => ({ name, count: s.size }))
      .sort((a, b) => b.count - a.count)

    const teacherStats: Record<string, Set<number>> = {}
    activeStudentGroups.forEach((sg) => {
      sg.group.teachers.forEach((tg) => {
        const teacherName = tg.teacher.name
        if (!teacherStats[teacherName]) teacherStats[teacherName] = new Set()
        teacherStats[teacherName].add(sg.studentId)
      })
    })
    const teachers = Object.entries(teacherStats)
      .map(([name, s]) => ({ name, count: s.size }))
      .sort((a, b) => b.count - a.count)

    const courseStats: Record<string, Set<number>> = {}
    activeStudentGroups.forEach((sg) => {
      const courseName = sg.group.course.name
      if (!courseStats[courseName]) courseStats[courseName] = new Set()
      courseStats[courseName].add(sg.studentId)
    })
    const courses = Object.entries(courseStats)
      .map(([name, s]) => ({ name, count: s.size }))
      .sort((a, b) => b.count - a.count)

    const totalGroups = new Set(activeStudentGroups.map((sg) => sg.groupId)).size
    const avgPerGroup = totalGroups > 0 ? Math.round((totalStudents / totalGroups) * 10) / 10 : 0

    return {
      totalStudents,
      newThisMonth,
      newPrevMonth,
      growthPercent,
      totalGroups,
      avgPerGroup,
      monthly,
      locations,
      teachers,
      courses,
    }
  })
