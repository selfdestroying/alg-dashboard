'use server'

import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { addToGroup } from './groups'

export type DismissedWithStudentAndGroup = Prisma.DismissedGetPayload<{
  include: {
    student: true
    group: { include: { course: true; teachers: { include: { teacher: true } } } }
  }
}>

export async function getDismissed(payload: Prisma.DismissedFindFirstArgs) {
  const dismissed = await prisma.dismissed.findMany(payload)
  return dismissed
}

export async function addDismissed(payload: Prisma.DismissedCreateArgs) {
  await prisma.dismissed.create(payload)
  revalidatePath(`/dashboard/groups/${payload.data.groupId}`)
}

export async function removeDismissed(payload: Prisma.DismissedDeleteArgs) {
  await prisma.dismissed.delete(payload)
  revalidatePath('/dashboard/dismissed')
}

export async function returnToGroup(payload: {
  dismissedId: number
  groupId: number
  studentId: number
}) {
  const { dismissedId, groupId, studentId } = payload
  await prisma.$transaction(async () => {
    await addToGroup({ groupId, studentId })
    await removeDismissed({ where: { id: dismissedId } })
  })

  revalidatePath('/dashboard/dismissed')
}

export async function getDismissedStatistics() {
  const dismissed = await prisma.dismissed.findMany({
    include: {
      group: {
        include: {
          course: true,
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
      date: 'asc',
    },
  })

  // Группировка по месяцам
  const monthlyStats = dismissed.reduce(
    (acc, item) => {
      const monthKey = new Date(item.date).toLocaleDateString('ru-RU', {
        month: 'short',
      })
      acc[monthKey] = (acc[monthKey] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  // Расчет статистики по преподавателям с процентами
  // Собираем информацию о всех студентах преподавателей
  const allGroups = await prisma.group.findMany({
    include: {
      teachers: {
        include: {
          teacher: true,
        },
      },
      students: {
        select: {
          studentId: true,
        },
      },
    },
  })

  // Подсчитываем общее количество студентов у каждого преподавателя
  const teacherTotalStudents = allGroups.reduce(
    (acc, group) => {
      group.teachers.forEach((t) => {
        const teacherName = `${t.teacher.firstName} ${t.teacher.lastName || ''}`
        if (!acc[teacherName]) {
          acc[teacherName] = new Set<number>()
        }
        group.students.forEach((s) => {
          acc[teacherName].add(s.studentId)
        })
      })
      return acc
    },
    {} as Record<string, Set<number>>
  )

  // Подсчитываем отчисленных у каждого преподавателя
  const teacherDismissedCount = dismissed.reduce(
    (acc, item) => {
      item.group.teachers.forEach((t) => {
        const teacherName = `${t.teacher.firstName} ${t.teacher.lastName || ''}`
        acc[teacherName] = (acc[teacherName] || 0) + 1
      })
      return acc
    },
    {} as Record<string, number>
  )

  // Вычисляем процент оттока для каждого преподавателя
  const teacherStats = Object.entries(teacherDismissedCount).map(([name, dismissed]) => {
    const total = teacherTotalStudents[name]?.size || 0
    const percentage = total > 0 ? (dismissed / total) * 100 : 0
    return {
      name,
      dismissed,
      total,
      percentage: Math.round(percentage * 10) / 10, // Округляем до 1 знака
    }
  })

  // Группировка по курсам
  const courseStats = dismissed.reduce(
    (acc, item) => {
      const courseName = item.group.course.name
      acc[courseName] = (acc[courseName] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return {
    monthly: Object.entries(monthlyStats)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()),
    teachers: teacherStats.sort((a, b) => b.percentage - a.percentage),
    courses: Object.entries(courseStats)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
  }
}
