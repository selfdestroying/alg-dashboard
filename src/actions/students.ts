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
        makeupForAttendanceId: null, // исключаем отработки в чужих группах
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
