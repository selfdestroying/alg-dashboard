'use server'

import prisma from '@/lib/prisma'
import { Course, Group, Lesson, Prisma, Student, User } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export type GroupWithTeacherAndCourse = Prisma.GroupGetPayload<{
  include: { teacher: true; course: true }
}>
export type AllGroupData = Omit<Omit<Group, 'students'>, 'lessons'> & {
  teacher: User
  course: Course
  lessons: Lesson[]
  students: Student[]
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
      students: { include: { student: true } },
      lessons: { orderBy: [{ date: 'asc' }, { time: 'asc' }] },
    },
  })
  const groupWithStudents: AllGroupData = {
    ...group,
    students: group.students.map((s) => s.student),
  }

  return groupWithStudents
}

export const createGroup = async (data: Prisma.GroupCreateInput) => {
  await prisma.group.create({ data })
  revalidatePath('dashboard/groups')
}

export const deleteGroup = async (id: number) => {
  await prisma.group.delete({ where: { id } })
  revalidatePath('dashboard/groups')
}

export const addToGroup = async (data: Prisma.StudentGroupUncheckedCreateInput) => {
  await prisma.studentGroup.create({ data })
  revalidatePath(`/dashboard/groups/${data.groupId}`)
}

export const removeFromGroup = async (data: Prisma.StudentGroupUncheckedCreateInput) => {
  await prisma.studentGroup.delete({ where: { studentId_groupId: { ...data } } })
  revalidatePath(`/dashboard/groups/${data.groupId}`)
}
