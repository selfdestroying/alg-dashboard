'use server'
import prisma from '@/src/lib/db/prisma'
import {
  type StudentFinancialAudit,
  FINANCIAL_FIELD_KEY,
  parseIntFieldChange,
  writeFinancialHistoryTx,
} from '@/src/lib/lessons-balance'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Group, Prisma, Student } from '../../prisma/generated/client'
import {
  StudentFinancialField,
  StudentLessonsBalanceChangeReason,
} from '../../prisma/generated/enums'
import { auth } from '../lib/auth/server'
import { protocol, rootDomain } from '../lib/utils'

export type StudentWithGroups = Student & { groups: Group[] }

export const getStudents = async <T extends Prisma.StudentFindManyArgs>(
  payload?: Prisma.SelectSubset<T, Prisma.StudentFindManyArgs>,
) => {
  return await prisma.student.findMany<T>(payload)
}

export const getStudent = async <T extends Prisma.StudentFindFirstArgs>(
  payload: Prisma.SelectSubset<T, Prisma.StudentFindFirstArgs>,
) => {
  return await prisma.student.findFirst<T>(payload)
}

export async function updateStudent(
  payload: Prisma.StudentUpdateArgs,
  audit?: StudentFinancialAudit,
) {
  const data = payload.data as Prisma.StudentUpdateInput | undefined

  // Detect which financial fields are being changed
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
    revalidatePath(`dashboard/students/${studentId}`)
    return
  }

  // Verify each changed field has an audit reason
  for (const c of changes) {
    if (!audit?.[c.field]) {
      throw new Error(`Для изменения поля ${c.key} требуется указать причину (audit.${c.field})`)
    }
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect(`${protocol}://auth.${rootDomain}/sign-in`)
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
        organizationId: session.organizationId!,
        studentId,
        actorUserId: Number(session.user.id),
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

  revalidatePath(`dashboard/students/${studentId}`)

  const lessonsBalanceAudit = audit?.[StudentFinancialField.LESSONS_BALANCE]
  if (lessonsBalanceAudit?.reason === StudentLessonsBalanceChangeReason.PAYMENT_CREATED) {
    revalidatePath('/finances/payments')
  }
}

export async function getStudentLessonsBalanceHistory(
  studentId: number,
  take = 50,
  groupId?: number,
) {
  return await prisma.studentLessonsBalanceHistory.findMany({
    where: { studentId, ...(groupId != null ? { groupId } : {}) },
    take,
    orderBy: { createdAt: 'desc' },
    include: {
      actorUser: true,
      group: { include: { course: true, location: true } },
    },
  })
}

/**
 * Update financial fields on a specific StudentGroup (per-group balance).
 * Data should contain Prisma-style increments/decrements/sets for lessonsBalance, totalLessons, totalPayments.
 * Optionally creates a Payment record in the same transaction.
 */
export async function updateStudentGroupBalance(
  studentId: number,
  groupId: number,
  data: {
    lessonsBalance?: Prisma.IntFieldUpdateOperationsInput | number
    totalLessons?: Prisma.IntFieldUpdateOperationsInput | number
    totalPayments?: Prisma.IntFieldUpdateOperationsInput | number
  },
  audit: StudentFinancialAudit,
  payment?: {
    lessonCount: number
    price: number
    bidForLesson: number
    leadName: string
    productName: string
  },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) {
    redirect(`${protocol}://auth.${rootDomain}/sign-in`)
  }

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

    // Create payment record if provided
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
        organizationId: session.organizationId!,
        studentId,
        actorUserId: Number(session.user.id),
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

  revalidatePath(`dashboard/students/${studentId}`)
}

/**
 * Redistribute unallocated balance from Student to StudentGroups.
 * Each allocation can redistribute lessonsBalance, totalLessons, and/or totalPayments.
 */
export async function redistributeBalance(
  studentId: number,
  allocations: {
    groupId: number
    lessons?: number
    totalLessons?: number
    totalPayments?: number
  }[],
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) {
    redirect(`${protocol}://auth.${rootDomain}/sign-in`)
  }

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

      // Write history for each redistributed field
      if (hasLessons) {
        await writeFinancialHistoryTx(tx, {
          organizationId: session.organizationId!,
          studentId,
          actorUserId: Number(session.user.id),
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
          organizationId: session.organizationId!,
          studentId,
          actorUserId: Number(session.user.id),
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
          organizationId: session.organizationId!,
          studentId,
          actorUserId: Number(session.user.id),
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

  revalidatePath(`dashboard/students/${studentId}`)
}

export type StudentGroupHistoryEntry = {
  type: 'joined' | 'dismissed'
  date: Date
  groupId: number
  groupName: string
  status?: string
}

export async function getStudentGroupHistory(
  studentId: number,
  organizationId: number,
): Promise<StudentGroupHistoryEntry[]> {
  const DaysShort: Record<number, string> = {
    1: 'Пн',
    2: 'Вт',
    3: 'Ср',
    4: 'Чт',
    5: 'Пт',
    6: 'Сб',
    0: 'Вс',
  }

  const [attendances, currentGroups] = await Promise.all([
    prisma.attendance.findMany({
      where: {
        studentId,
        organizationId,
        asMakeupFor: null, // исключаем отработки в чужих группах
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

  // Группируем посещения по groupId, вычисляем первый / последний урок
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
    const sorted = [...g.schedules].sort(
      (a, b) => ((a.dayOfWeek + 6) % 7) - ((b.dayOfWeek + 6) % 7),
    )
    const parts = sorted.map((s) => `${DaysShort[s.dayOfWeek]} ${s.time}`)
    return `${g.course.name} ${parts.join(', ')}`
  }

  const entries: StudentGroupHistoryEntry[] = []

  for (const [groupId, stats] of groupStats) {
    const name = buildGroupName(stats.group)

    // Зачисление — первый урок в группе
    entries.push({
      type: 'joined',
      date: stats.firstDate,
      groupId,
      groupName: name,
      status: currentGroupMap.get(groupId) ?? undefined,
    })

    // Отчисление — если ученик больше не в группе, последний урок
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
}

export async function updateStudentBalanceHistory(
  payload: Prisma.StudentLessonsBalanceHistoryUpdateArgs,
) {
  const history = await prisma.studentLessonsBalanceHistory.update(payload)
  revalidatePath(`/students/${history.studentId}`)
}

export const deleteStudent = async (payload: Prisma.StudentDeleteArgs) => {
  await prisma.student.delete(payload)
  revalidatePath('dashboard/students')
}
