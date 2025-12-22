'use server'
import prisma from '@/lib/prisma'
import { Group, Prisma, Student } from '@prisma/client'
import { randomUUID } from 'crypto'
import { revalidatePath } from 'next/cache'
import { addToGroup } from './groups'

export type StudentWithGroups = Student & { groups: Group[] }

export type StudentWithGroupsAndAttendance = Prisma.StudentGetPayload<{
  include: {
    groups: { include: { group: { include: { lessons: true } } } }
    attendances: {
      include: {
        lesson: true
        asMakeupFor: { include: { missedAttendance: { include: { lesson: true } } } }
        missedMakeup: { include: { makeUpAttendance: { include: { lesson: true } } } }
      }
    }
  }
}>

export const getStudents = async (payload: Prisma.StudentFindManyArgs) => {
  const students = await prisma.student.findMany(payload)
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

export const getStudentWithAttendance = async (id: number) => {
  const student = await prisma.student.findFirstOrThrow({
    where: { id },
    include: {
      groups: {
        include: {
          group: {
            include: { lessons: true },
          },
        },
      },
      attendances: {
        include: {
          lesson: true,
          asMakeupFor: { include: { missedAttendance: { include: { lesson: true } } } },
          missedMakeup: { include: { makeUpAttendance: { include: { lesson: true } } } },
        },
      },
    },
  })

  return student
}

export const createStudent = async (
  data: Omit<Prisma.StudentCreateInput, 'login' | 'password'>,
  groupId: number | undefined
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
  if (groupId) {
    await addToGroup({
      groupId,
      studentId: student.id,
      status: 'ACTIVE',
    })
  }
  revalidatePath('dashboard/students')
}

export async function updateStudentCard(studentData: Student) {
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
        totalLessons: Number(studentData.totalLessons),
        totalPayments: Number(studentData.totalPayments),
        lessonsBalance: Number(studentData.lessonsBalance),
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

export async function updateStudent(payload: Prisma.StudentUpdateArgs) {
  await prisma.student.update(payload)
}

export const deleteStudent = async (id: number) => {
  await prisma.student.delete({ where: { id } })
  revalidatePath('dashboard/students')
}

export const getActiveStudents = async () => {
  const students = await prisma.student.findMany({
    where: {
      groups: {
        some: {},
      },
    },
    include: {
      groups: {
        include: {
          group: true,
        },
      },
      payments: true,
    },
  })

  return students
}
