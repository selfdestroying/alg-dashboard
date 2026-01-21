'use server'

import { prisma } from '@/lib/prisma'
import { DaysOfWeek } from '@/lib/utils'
import { Prisma } from '@prisma/client'
import { startOfDay } from 'date-fns'
import { fromZonedTime } from 'date-fns-tz'
import { revalidatePath } from 'next/cache'
import { createLesson } from './lessons'

export const getGroups = async () => {
  const groups = await prisma.group.findMany({
    include: {
      teachers: {
        include: {
          teacher: true,
        },
      },
      course: true,
      location: true,
      _count: {
        select: {
          students: true,
        },
      },
    },
  })
  return groups
}

export const getGroup = async (id: number) => {
  const group = await prisma.group.findFirstOrThrow({
    where: { id },
    include: {
      location: true,
      teachers: {
        include: {
          teacher: true,
        },
      },
      course: true,
      students: { include: { student: { include: { _count: { select: { groups: true } } } } } },
      lessons: {
        orderBy: [{ date: 'asc' }, { time: 'asc' }],
        include: { _count: { select: { attendance: { where: { status: 'UNSPECIFIED' } } } } },
      },
    },
  })

  return group
}

export const createGroup = async (groupPayload: Prisma.GroupCreateArgs, teacherId: number) => {
  const course = await prisma.course.findFirst({
    where: {
      id: groupPayload.data.courseId,
    },
  })
  const groupName = `${course?.name} ${DaysOfWeek.short[(groupPayload.data.startDate as Date).getDay()]} ${groupPayload.data.time ?? ''}`
  const group = await prisma.group.create({ data: { ...groupPayload.data, name: groupName } })
  await prisma.teacherGroup.create({ data: { groupId: group.id, teacherId } })
  if (groupPayload.data.lessonCount) {
    const lessonDate = group.startDate
    for (let i = 0; i < groupPayload.data.lessonCount; i++) {
      await createLesson({ groupId: group.id, time: group.time, date: lessonDate })
      if (lessonDate) {
        lessonDate.setDate(lessonDate.getDate() + 7)
      }
    }
  }

  revalidatePath('dashboard/groups')
}

export const updateGroup = async (payload: Prisma.GroupUpdateArgs) => {
  console.log('Node TZ:', Intl.DateTimeFormat().resolvedOptions().timeZone, new Date().toString())
  await prisma.group.update(payload)
  const dayOfWeek = payload.data.dayOfWeek
  if (dayOfWeek != null) {
    const lessons = await prisma.lesson.findMany({
      where: { groupId: payload.where.id, date: { gte: startOfDay(new Date()) } },
    })

    const nearestWeekDay = startOfDay(new Date())
    const currentDay = nearestWeekDay.getDay()

    let diff = ((dayOfWeek as number) - currentDay + 7) % 7

    if (diff === 0) {
      diff = 7
    }

    nearestWeekDay.setDate(nearestWeekDay.getDate() + diff)
    console.log(nearestWeekDay)
    for (const lesson of lessons) {
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: { date: fromZonedTime(nearestWeekDay, 'Europe/Moscow') },
      })
      nearestWeekDay.setDate(nearestWeekDay.getDate() + 7)
    }
  }
  revalidatePath(`/dashboard/groups/${payload.where.id}`)
}

export const deleteGroup = async (id: number) => {
  await prisma.group.delete({ where: { id } })
  revalidatePath('dashboard/groups')
}

export const createStudentGroup = async (payload: Prisma.StudentGroupUncheckedCreateInput) => {
  const { studentId, groupId } = payload

  await prisma.$transaction(async (tx) => {
    await tx.studentGroup.create({ data: payload })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const futureLessons = await tx.lesson.findMany({
      where: {
        groupId,
        date: { gte: today },
      },
      select: { id: true },
    })

    if (futureLessons.length > 0) {
      const attendanceData = futureLessons.map((lesson) => ({
        lessonId: lesson.id,
        studentId,
        comment: '',
        status: 'UNSPECIFIED' as const,
      }))

      await tx.attendance.createMany({
        data: attendanceData,
        skipDuplicates: true,
      })
    }
  })

  revalidatePath(`/dashboard/groups/${groupId}`)
}

export const deleteStudentGroup = async (payload: Prisma.StudentGroupUncheckedCreateInput) => {
  const { studentId, groupId } = payload

  await prisma.$transaction(async (tx) => {
    await tx.studentGroup.delete({
      where: { studentId_groupId: { studentId, groupId } },
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const futureLessons = await tx.lesson.findMany({
      where: {
        groupId,
        date: { gte: today },
      },
      select: { id: true },
    })

    if (futureLessons.length > 0) {
      const lessonIds = futureLessons.map((l) => l.id)

      await tx.attendance.deleteMany({
        where: {
          studentId,
          lessonId: { in: lessonIds },
          status: 'UNSPECIFIED',
        },
      })
    }
  })

  revalidatePath(`/dashboard/groups/${groupId}`)
}

export const updateTeacherGroup = async (
  payload: Prisma.TeacherGroupUpdateArgs,
  isApplyToLessons: boolean
) => {
  await prisma.$transaction(async (tx) => {
    const teacherGroup = await tx.teacherGroup.update(payload)

    if (isApplyToLessons) {
      await tx.teacherLesson.updateMany({
        where: {
          teacherId: teacherGroup.teacherId,
          lesson: {
            date: { gt: new Date() },
            groupId: teacherGroup.groupId,
          },
        },
        data: {
          bid: teacherGroup.bid,
        },
      })
    }
  })

  revalidatePath(`/dashboard/groups/${payload.data.groupId}`)
}

export const createTeacherGroup = async (
  payload: Prisma.TeacherGroupCreateArgs,
  isApplyToLessons: boolean
) => {
  await prisma.$transaction(async (tx) => {
    const teacherGroup = await tx.teacherGroup.create(payload)
    if (isApplyToLessons) {
      const lessons = await tx.lesson.findMany({
        where: {
          groupId: teacherGroup.groupId,
          date: { gt: new Date() },
          teachers: { none: { teacherId: payload.data.teacherId } },
        },
      })
      for (const lesson of lessons) {
        await tx.teacherLesson.create({
          data: {
            lessonId: lesson.id,
            teacherId: payload.data.teacherId as number,
            bid: teacherGroup.bid,
          },
        })
      }
    }
  })
  revalidatePath(`/dashboard/groups/${payload.data.groupId}`)
}

export const deleteTeacherGroup = async (
  payload: Prisma.TeacherGroupDeleteArgs,
  isApplyToLessons: boolean
) => {
  await prisma.$transaction(async (tx) => {
    const teacherGroup = await tx.teacherGroup.delete({
      ...payload,
      include: {
        group: true,
      },
    })
    if (isApplyToLessons) {
      await tx.teacherLesson.deleteMany({
        where: {
          teacherId: teacherGroup.teacherId,
          lesson: {
            date: { gt: new Date() },
            groupId: teacherGroup.groupId,
          },
        },
      })
    }
  })
  revalidatePath(`/dashboard/groups/${payload.where.groupId}`)
}

export const updateStudentGroup = async (payload: Prisma.StudentGroupUpdateArgs) => {
  await prisma.studentGroup.update(payload)
}
