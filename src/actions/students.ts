'use server'
import { prisma } from '@/lib/prisma'
import { Group, Prisma, Student } from '@prisma/client'
import { randomUUID } from 'crypto'
import { revalidatePath } from 'next/cache'
import { createStudentGroup } from './groups'

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

export const getStudents = async (payload?: Prisma.StudentFindManyArgs) => {
  return await prisma.student.findMany(payload)
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
            include: {
              lessons: {
                orderBy: {
                  date: 'asc',
                },
              },
            },
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
  groupId?: number
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
    await createStudentGroup({
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
  const students = await prisma.studentGroup.findMany({
    include: {
      group: {
        include: {
          location: true,
          course: true,
          teachers: {
            include: {
              teacher: true,
            },
          },
        },
      },
      student: {
        include: {
          payments: true,
        },
      },
    },
  })

  return students
}

export async function getActiveStudentStatistics() {
  const activeStudentGroups = await prisma.studentGroup.findMany({
    include: {
      group: {
        include: {
          course: true,
          location: true,
          teachers: {
            include: {
              teacher: true,
            },
          },
        },
      },
      student: true,
    },
    orderBy: {
      student: {
        createdAt: 'asc',
      },
    },
  })

  console.log(activeStudentGroups.length)

  // 1. Monthly Statistics (New Students per Month)
  const uniqueStudentsMap = new Map<number, (typeof activeStudentGroups)[0]['student']>()
  activeStudentGroups.forEach((sg) => {
    uniqueStudentsMap.set(sg.student.id, sg.student)
  })

  const monthlyStats: Record<string, number> = {}
  uniqueStudentsMap.forEach((student) => {
    const date = new Date(student.createdAt)
    const monthKey = date.toLocaleDateString('ru-RU', {
      month: 'short',
    })
    monthlyStats[monthKey] = (monthlyStats[monthKey] || 0) + 1
  })

  const monthly = Object.entries(monthlyStats).map(([month, count]) => ({
    month,
    count,
  }))

  // 2. By Location
  const locationStats: Record<string, Set<number>> = {}
  activeStudentGroups.forEach((sg) => {
    const locName = sg.group.location?.name || 'Не указано'
    if (!locationStats[locName]) {
      locationStats[locName] = new Set()
    }
    locationStats[locName].add(sg.studentId)
  })

  const locations = Object.entries(locationStats)
    .map(([name, studentSet]) => ({
      name,
      count: studentSet.size,
    }))
    .sort((a, b) => b.count - a.count)

  // 3. By Teacher
  const teacherStats: Record<string, Set<number>> = {}
  activeStudentGroups.forEach((sg) => {
    sg.group.teachers.forEach((tg) => {
      const teacherName = `${tg.teacher.firstName} ${tg.teacher.lastName || ''}`.trim()
      if (!teacherStats[teacherName]) {
        teacherStats[teacherName] = new Set()
      }
      teacherStats[teacherName].add(sg.studentId)
    })
  })

  const teachers = Object.entries(teacherStats)
    .map(([name, studentSet]) => ({
      name,
      count: studentSet.size,
    }))
    .sort((a, b) => b.count - a.count)

  // 4. By Course
  const courseStats: Record<string, Set<number>> = {}
  activeStudentGroups.forEach((sg) => {
    const courseName = sg.group.course.name
    if (!courseStats[courseName]) {
      courseStats[courseName] = new Set()
    }
    courseStats[courseName].add(sg.studentId)
  })

  const courses = Object.entries(courseStats)
    .map(([name, studentSet]) => ({
      name,
      count: studentSet.size,
    }))
    .sort((a, b) => b.count - a.count)

  return {
    monthly,
    locations,
    teachers,
    courses,
  }
}
