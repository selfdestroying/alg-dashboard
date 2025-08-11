'use server'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { randomUUID } from 'crypto'
import { revalidatePath } from 'next/cache'

export const getStudents = async () => {
  const students = await prisma.student.findMany({
    include: {
      _count: { select: { groups: true } },
    },
  })
  return students
}

export const getStudent = async (id: number) => {
  const student = await prisma.student.findFirstOrThrow({
    where: { id },
    include: { groups: { include: { group: true } } },
  })
  const studentWithGroups = { ...student, groups: student?.groups.map((group) => group.group) }
  return studentWithGroups
}

export const createStudent = async (
  data: Omit<Prisma.StudentCreateInput, 'login' | 'password'>
) => {
  await prisma.student.create({
    data: {
      ...data,
      password: 'student',
      login: `student-${randomUUID().slice(0, 4)}`,
    },
  })
  revalidatePath('dashboard/students')
}

export const deleteStudent = async (id: number) => {
  await prisma.student.delete({ where: { id } })
  revalidatePath('dashboard/students')
}
