'use server'

import prisma from '@/lib/prisma'
import { DayOfWeekShort } from '@/lib/utils'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { createLesson } from './lessons'

export type GroupWithTeacherAndCourse = Prisma.GroupGetPayload<{
  include: {
    teachers: {
      include: {
        teacher: {
          omit: {
            password: true
            passwordRequired: true
            createdAt: true
          }
        }
      }
    }
    course: true
  }
}>

export const getGroups = async (): Promise<GroupWithTeacherAndCourse[]> => {
  const groups = await prisma.group.findMany({
    include: {
      teachers: {
        include: {
          teacher: {
            omit: {
              password: true,
              passwordRequired: true,
              createdAt: true,
            },
          },
        },
      },
      course: true,
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
          teacher: {
            omit: {
              password: true,
              passwordRequired: true,
            },
          },
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
  const groupName = `${course?.name} ${DayOfWeekShort[(groupPayload.data.startDate as Date).getDay()]} ${groupPayload.data.time ?? ''}`
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
  await prisma.group.update(payload)
  revalidatePath(`/dashboard/groups/${payload.where.id}`)
}

export const deleteGroup = async (id: number) => {
  await prisma.group.delete({ where: { id } })
  revalidatePath('dashboard/groups')
}

export const addToGroup = async (data: Prisma.StudentGroupUncheckedCreateInput) => {
  const { studentId, groupId } = data

  await prisma.$transaction(async (tx) => {
    await tx.studentGroup.create({ data })

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

export const removeFromGroup = async (data: Prisma.StudentGroupUncheckedCreateInput) => {
  const { studentId, groupId } = data

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

export async function updateTeacherGroupBid(
  bidForLesson: number | null,
  teacherId: number,
  groupId: number
) {
  await prisma.teacherGroup.update({
    where: {
      teacherId_groupId: {
        teacherId,
        groupId,
      },
    },
    data: {
      bidForLesson,
    },
  })
}

export async function addTeacherToGroup(payload: Prisma.TeacherGroupCreateArgs) {
  await prisma.teacherGroup.create(payload)
  revalidatePath(`/dashboard/groups/${payload.data.groupId}`)
}

export async function removeTeacherFromGroup(payload: Prisma.TeacherGroupDeleteArgs) {
  await prisma.teacherGroup.delete(payload)
  revalidatePath(`/dashboard/groups/${payload.where.groupId}`)
}

export async function updateStudentGroup(payload: Prisma.StudentGroupUpdateArgs) {
  await prisma.studentGroup.update(payload)
}
