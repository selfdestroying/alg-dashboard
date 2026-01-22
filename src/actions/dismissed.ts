'use server'

import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { createStudentGroup } from './groups'

export type DismissedWithStudentAndGroup = Prisma.DismissedGetPayload<{
  include: {
    student: true
    group: { include: { course: true; location: true; teachers: { include: { teacher: true } } } }
  }
}>

export async function getDismissed(payload: Prisma.DismissedFindFirstArgs) {
  const dismissed = await prisma.dismissed.findMany(payload)
  return dismissed
}

export async function createDismissed(payload: Prisma.DismissedCreateArgs) {
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
    await createStudentGroup({ data: { groupId, studentId } }, false)
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
  const allGroups = await prisma.teacherGroup.findMany({
    include: {
      group: {
        select: {
          _count: { select: { students: true } },
        },
      },
      teacher: true,
    },
    orderBy: { teacher: { id: 'asc' } },
  })

  const teacherStudentCounts: Record<string, number> = {}
  allGroups.forEach((tg) => {
    const teacherName = `${tg.teacher.firstName} ${tg.teacher.lastName || ''}`
    const studentCount = tg.group._count.students
    if (!teacherStudentCounts[teacherName]) {
      teacherStudentCounts[teacherName] = 0
    }
    teacherStudentCounts[teacherName] += studentCount
  })

  // Считаем количество отчисленных по каждому преподавателю
  const dismissedByTeacher: Record<string, number> = {}
  dismissed.forEach((item) => {
    item.group.teachers.forEach((tg) => {
      const teacherName = `${tg.teacher.firstName} ${tg.teacher.lastName || ''}`
      if (!dismissedByTeacher[teacherName]) {
        dismissedByTeacher[teacherName] = 0
      }
      dismissedByTeacher[teacherName] += 1
    })
  })

  // Формируем итоговую статистику с процентами
  const teacherStats = Object.entries(dismissedByTeacher).map(([teacherName, count]) => {
    const totalStudents = teacherStudentCounts[teacherName] || 0
    const percentage =
      totalStudents > 0 ? (Number(count) / (totalStudents + Number(count))) * 100 : 0
    return {
      teacherName,
      dismissedCount: Number(count),
      totalStudents,
      percentage: Math.round(percentage * 100) / 100, // Округление до двух знаков
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

  // Группировка по локациям
  const locationStats = dismissed.reduce(
    (acc, item) => {
      const locationName = item.group.location?.name || 'Не указано'
      acc[locationName] = (acc[locationName] || 0) + 1
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
    locations: Object.entries(locationStats)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
  }
}
