'use server'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export const getStudents = async () => {
  const students = await prisma.student.findMany()
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

export const createStudent = async (data: Prisma.StudentCreateInput) => {
  await prisma.student.create({ data })
  revalidatePath('dashboard/students')
}

export const deleteStudent = async (id: number) => {
  await prisma.student.delete({ where: { id } })
  revalidatePath('dashboard/students')
}
