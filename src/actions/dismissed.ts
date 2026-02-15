'use server'

import prisma from '@/src/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Prisma } from '../../prisma/generated/client'

export type DismissedWithStudentAndGroup = Prisma.DismissedGetPayload<{
  include: {
    student: true
    group: {
      include: {
        course: true
        location: true
        teachers: { include: { teacher: { include: { members: true } } } }
      }
    }
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
  organizationId: number
}) {
  const { dismissedId, groupId, studentId } = payload
  await prisma.$transaction(async (tx) => {
    await tx.dismissed.delete({ where: { id: dismissedId } })
    const lastAttendance = await tx.attendance.findFirst({
      where: {
        studentId,
        lesson: {
          groupId,
        },
      },
      include: {
        lesson: true,
      },
      orderBy: {
        lesson: { date: 'desc' },
      },
    })
    await tx.studentGroup.create({
      data: {
        studentId,
        groupId,
        organizationId: payload.organizationId,
        status: 'ACTIVE',
      },
    })
    if (lastAttendance) {
      const lessons = await tx.lesson.findMany({
        where: {
          organizationId: payload.organizationId,
          groupId,
          date: { gt: lastAttendance.lesson.date },
        },
      })
      for (const lesson of lessons) {
        await tx.attendance.create({
          data: {
            organizationId: lesson.organizationId,
            lessonId: lesson.id,
            studentId,
            status: 'UNSPECIFIED',
            comment: '',
          },
        })
      }
    }
  })

  revalidatePath('/dashboard/dismissed')
}

export async function getDismissedStatistics(organizationId: number) {
  const dismissed = await prisma.dismissed.findMany({
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
    where: { organizationId },
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
    const teacherName = tg.teacher.name
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
      const teacherName = tg.teacher.name
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
