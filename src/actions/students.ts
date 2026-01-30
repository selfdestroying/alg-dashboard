'use server'
import {
  type LessonsBalanceAudit,
  parseLessonsBalanceChange,
  requireActorUserId,
  writeLessonsBalanceHistoryTx,
} from '@/lib/lessons-balance'
import { prisma } from '@/lib/prisma'
import { Group, Prisma, Student, StudentLessonsBalanceChangeReason } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export type StudentWithGroups = Student & { groups: Group[] }
export type StudentWithGroupsAndAttendance = Prisma.StudentGetPayload<{
  include: {
    groups: { include: { group: { include: { lessons: true } } } }
    attendances: {
      include: {
        lesson: true
        asMakeupFor: { include: { missedAttendance: { include: { lesson: true } } } }
        missedMakeup: { include: { makeUpAttendance: { include: { lesson: true } } } }
      }
    }
  }
}>

export const getStudents = async <T extends Prisma.StudentFindManyArgs>(
  payload?: Prisma.SelectSubset<T, Prisma.StudentFindManyArgs>
) => {
  return await prisma.student.findMany<T>(payload)
}

export const getStudent = async <T extends Prisma.StudentFindFirstArgs>(
  payload: Prisma.SelectSubset<T, Prisma.StudentFindFirstArgs>
) => {
  return await prisma.student.findFirst<T>(payload)
}

export const createStudent = async (payload: Prisma.StudentCreateArgs) => {
  await prisma.student.create(payload)
  revalidatePath('dashboard/students')
}

export async function updateStudent(
  payload: Prisma.StudentUpdateArgs,
  audit?: {
    lessonsBalance?: LessonsBalanceAudit
  }
) {
  const lessonsBalanceChange = parseLessonsBalanceChange(
    (payload.data as Prisma.StudentUpdateInput | undefined)?.lessonsBalance
  )

  const studentId = payload.where.id
  if (!studentId) {
    await prisma.student.update(payload)
    return
  }

  if (!lessonsBalanceChange) {
    await prisma.student.update(payload)
    revalidatePath(`dashboard/students/${studentId}`)
    return
  }

  if (!audit?.lessonsBalance) {
    throw new Error('Для изменения баланса уроков требуется указать причину')
  }

  const lessonsBalanceAudit = audit.lessonsBalance
  const actorUserId = await requireActorUserId()

  await prisma.$transaction(async (tx) => {
    const student = await tx.student.findUnique({
      where: { id: studentId },
      select: { lessonsBalance: true },
    })

    if (!student) throw new Error('Ученик не найден')

    const balanceBefore = student.lessonsBalance

    const updated = await tx.student.update({
      where: { id: studentId },
      data: payload.data as Prisma.StudentUpdateInput,
      select: { lessonsBalance: true },
    })

    const balanceAfter = updated.lessonsBalance
    const delta = balanceAfter - balanceBefore

    await writeLessonsBalanceHistoryTx(tx, {
      studentId,
      actorUserId,
      reason: lessonsBalanceAudit.reason,
      delta,
      balanceBefore,
      balanceAfter,
      comment: lessonsBalanceAudit.comment,
      meta: lessonsBalanceAudit.meta,
    })
  })

  revalidatePath(`dashboard/students/${studentId}`)

  if (lessonsBalanceAudit.reason === StudentLessonsBalanceChangeReason.PAYMENT_CREATED) {
    revalidatePath('/dashboard/finances/payments')
  }
}

export async function getStudentLessonsBalanceHistory(studentId: number, take = 50) {
  return await prisma.studentLessonsBalanceHistory.findMany({
    where: { studentId },
    take,
    orderBy: { createdAt: 'desc' },
    include: {
      actorUser: {
        select: { firstName: true, lastName: true },
      },
    },
  })
}

export const deleteStudent = async (payload: Prisma.StudentDeleteArgs) => {
  await prisma.student.delete(payload)
  revalidatePath('dashboard/students')
}

export async function getActiveStudentStatistics() {
  const activeStudentGroups = await prisma.studentGroup.findMany({
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

  console.log(activeStudentGroups.length)

  // 1. Monthly Statistics (New Students per Month)
  const uniqueStudentsMap = new Map<number, (typeof activeStudentGroups)[0]['student']>()
  activeStudentGroups.forEach((sg) => {
    uniqueStudentsMap.set(sg.student.id, sg.student)
  })

  const monthlyStats: Record<string, number> = {}
  uniqueStudentsMap.forEach((student) => {
    const date = new Date(student.createdAt)
    const monthKey = date.toLocaleDateString('ru-RU', {
      month: 'short',
    })
    monthlyStats[monthKey] = (monthlyStats[monthKey] || 0) + 1
  })

  const monthly = Object.entries(monthlyStats).map(([month, count]) => ({
    month,
    count,
  }))

  // 2. By Location
  const locationStats: Record<string, Set<number>> = {}
  activeStudentGroups.forEach((sg) => {
    const locName = sg.group.location?.name || 'Не указано'
    if (!locationStats[locName]) {
      locationStats[locName] = new Set()
    }
    locationStats[locName].add(sg.studentId)
  })

  const locations = Object.entries(locationStats)
    .map(([name, studentSet]) => ({
      name,
      count: studentSet.size,
    }))
    .sort((a, b) => b.count - a.count)

  // 3. By Teacher
  const teacherStats: Record<string, Set<number>> = {}
  activeStudentGroups.forEach((sg) => {
    sg.group.teachers.forEach((tg) => {
      const teacherName = `${tg.teacher.firstName} ${tg.teacher.lastName || ''}`.trim()
      if (!teacherStats[teacherName]) {
        teacherStats[teacherName] = new Set()
      }
      teacherStats[teacherName].add(sg.studentId)
    })
  })

  const teachers = Object.entries(teacherStats)
    .map(([name, studentSet]) => ({
      name,
      count: studentSet.size,
    }))
    .sort((a, b) => b.count - a.count)

  // 4. By Course
  const courseStats: Record<string, Set<number>> = {}
  activeStudentGroups.forEach((sg) => {
    const courseName = sg.group.course.name
    if (!courseStats[courseName]) {
      courseStats[courseName] = new Set()
    }
    courseStats[courseName].add(sg.studentId)
  })

  const courses = Object.entries(courseStats)
    .map(([name, studentSet]) => ({
      name,
      count: studentSet.size,
    }))
    .sort((a, b) => b.count - a.count)

  return {
    monthly,
    locations,
    teachers,
    courses,
  }
}
