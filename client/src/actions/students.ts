'use server'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export const getStudents = async () => {
  const students = await prisma.student.findMany()
  return students
}

export const createStudent = async (data: Prisma.StudentCreateInput) => {
  await prisma.student.create({ data })
  revalidatePath('dashboard/students')
}

export const deleteStudent = async (id: number) => {
  await prisma.student.delete({ where: { id } })
  revalidatePath('dashboard/students')
}
