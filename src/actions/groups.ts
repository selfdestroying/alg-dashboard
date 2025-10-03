'use server'

import prisma from '@/lib/prisma'
import { DayOfWeek } from '@/lib/utils'
import { Course, Group, Prisma, Student, User } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { createLesson } from './lessons'

export type GroupWithTeacherAndCourse = Prisma.GroupGetPayload<{
  include: {
    teacher: {
      omit: {
        password: true
        passwordRequired: true
        createdAt: true
      }
    }
    course: true
  }
}>
export type AllGroupData = Omit<Omit<Group, 'students'>, 'lessons'> & {
  teacher: User
  course: Course
  lessons: Prisma.LessonGetPayload<{
    include: { _count: { select: { attendance: { where: { status: 'UNSPECIFIED' } } } } }
  }>[]
  students: (Student & { _count: { groups: number } })[]
}

export const getGroups = async (): Promise<GroupWithTeacherAndCourse[]> => {
  const groups = await prisma.group.findMany({
    include: { teacher: true, course: true },
  })
  return groups
}

export const getGroup = async (id: number): Promise<AllGroupData | null> => {
  const group = await prisma.group.findFirstOrThrow({
    where: { id },
    include: {
      teacher: true,
      course: true,
      students: { include: { student: { include: { _count: { select: { groups: true } } } } } },
      lessons: {
        orderBy: [{ date: 'asc' }, { time: 'asc' }],
        include: { _count: { select: { attendance: { where: { status: 'UNSPECIFIED' } } } } },
      },
    },
  })
  const groupWithStudents: AllGroupData = {
    ...group,
    students: group.students.map((s) => s.student),
  }

  return groupWithStudents
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

export const addToGroup = async (
  data: Prisma.StudentGroupUncheckedCreateInput,
  isCreatePayment: boolean
) => {
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
