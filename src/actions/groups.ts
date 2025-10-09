'use server'

import { Option } from '@/components/ui/multiselect'
import prisma from '@/lib/prisma'
import { DayOfWeek } from '@/lib/utils'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { createLesson, getLessons } from './lessons'

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
      students: { include: { student: { include: { _count: { select: { groups: true } } } } } },
      lessons: {
        orderBy: [{ date: 'asc' }, { time: 'asc' }],
        include: { _count: { select: { attendance: { where: { status: 'UNSPECIFIED' } } } } },
      },
    },
  })

  return group
}

export const createGroup = async (data: Omit<Prisma.GroupUncheckedCreateInput, 'name'>) => {
  const course = await prisma.course.findFirst({
    where: {
      id: data.courseId,
    },
  })
  const groupName = `${course?.name} ${DayOfWeek[(data.startDate as Date).getDay()]} ${data.time ?? ''}`
  const group = await prisma.group.create({ data: { ...data, name: groupName } })

  if (data.lessonCount) {
    const lessonDate = group.startDate
    for (let i = 0; i < data.lessonCount; i++) {
      await createLesson({ groupId: group.id, time: group.time, date: lessonDate })
      if (lessonDate) {
        lessonDate.setDate(lessonDate.getDate() + 7)
      }
    }
  }

  revalidatePath('dashboard/groups')
}

export const deleteGroup = async (id: number) => {
  await prisma.group.delete({ where: { id } })
  revalidatePath('dashboard/groups')
}

export const addToGroup = async (data: Prisma.StudentGroupUncheckedCreateInput) => {
  await prisma.studentGroup.create({ data })
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const lessons = await prisma.lesson.findMany({
    where: { groupId: data.groupId, date: { gte: today } },
  })
  lessons.forEach(
    async (lesson) =>
      await prisma.attendance.create({
        data: {
          lessonId: lesson.id,
          studentId: data.studentId,
          comment: '',
          status: 'UNSPECIFIED',
        },
      })
  )

  revalidatePath(`/dashboard/groups/${data.groupId}`)
}

export const removeFromGroup = async (data: Prisma.StudentGroupUncheckedCreateInput) => {
  await prisma.studentGroup.delete({ where: { studentId_groupId: { ...data } } })
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const lessons = await prisma.lesson.findMany({
    where: { groupId: data.groupId, date: { gte: today } },
  })
  lessons.forEach(
    async (lesson) =>
      await prisma.attendance.delete({
        where: {
          studentId_lessonId: {
            studentId: data.studentId,
            lessonId: lesson.id,
          },
        },
      })
  )
  revalidatePath(`/dashboard/groups/${data.groupId}`)
}

export async function updateTeacherGroup(
  groupId: number,
  currentTeachers: Option[],
  newTeachers: Option[]
) {
  const currentTeacherIds = currentTeachers.map((teacher) => +teacher.value)
  const newTeacherIds = newTeachers.map((teacher) => +teacher.value)

  const currentSet = new Set(currentTeacherIds)
  const newSet = new Set(newTeacherIds)

  const toDelete = currentTeacherIds.filter((id) => !newSet.has(id))

  const toAdd = newTeacherIds.filter((id) => !currentSet.has(id))

  await prisma.$transaction(async (tx) => {
    const today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())

    if (toDelete.length > 0) {
      await tx.teacherGroup.deleteMany({
        where: {
          groupId,
          teacherId: { in: toDelete },
        },
      })
      await tx.teacherLesson.deleteMany({
        where: {
          teacherId: { in: toDelete },
          lesson: {
            groupId,
            date: { gte: today },
          },
        },
      })
    }

    if (toAdd.length > 0) {
      await tx.teacherGroup.createMany({
        data: toAdd.map((teacherId) => ({
          groupId,
          teacherId,
        })),
        skipDuplicates: true, // На случай, если дубликаты
      })
      const lessons = await getLessons({
        where: {
          date: { gte: today },
          groupId: groupId,
        },
      })
      for (const lesson of lessons) {
        await tx.teacherLesson.createMany({
          data: toAdd.map((teacherId) => ({
            teacherId,
            lessonId: lesson.id,
          })),
          skipDuplicates: true, // На случай, если дубликаты
        })
      }
    }
  })

  revalidatePath(`/dashboard/groups/${groupId}`)
}
