'use server'
import prisma from '@/lib/prisma'
import { Group, Prisma, Student } from '@prisma/client'
import { randomUUID } from 'crypto'
import { revalidatePath } from 'next/cache'

export type StudentWithGroups = Student & { groups: Group[] }

export const getStudents = async () => {
  const students = await prisma.student.findMany({
    include: {
      _count: { select: { groups: true } },
    },
  })
  return students
}

export const getStudent = async (id: number): Promise<StudentWithGroups> => {
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
  const student = await prisma.student.create({
    data: {
      ...data,
      password: 'student',
      login: `student-${randomUUID().slice(0, 4)}`,
    },
  })
  await prisma.cart.create({
    data: {
      studentId: student.id,
    },
  })
  revalidatePath('dashboard/students')
}

export async function updateStudent(studentData: StudentWithGroups) {
  try {
    const updated = await prisma.student.update({
      where: { id: studentData.id },
      data: {
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        age: Number(studentData.age),
        login: studentData.login,
        password: studentData.password,
        coins: Number(studentData.coins),
        parentsName: studentData.parentsName,
        crmUrl: studentData.crmUrl,
      },
    })

    // сброс кеша на странице конкретного ученика
    revalidatePath(`/dashboard/students/${studentData.id}`)

    return updated
  } catch (err) {
    console.error('Ошибка при обновлении ученика:', err)
    throw new Error('Не удалось обновить данные ученика')
  }
}

export const deleteStudent = async (id: number) => {
  await prisma.student.delete({ where: { id } })
  revalidatePath('dashboard/students')
}
