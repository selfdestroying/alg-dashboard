import prisma from '@/lib/prisma'

// Количество групп
export const getTotalGroups = async () => await prisma.group.count()
export const getTotalStudents = async () => await prisma.student.count()

// Группы, созданные за последний месяц
export const getRecentGroups = async () =>
  await prisma.group.count({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  })

export const getRecentStudents = async () =>
  await prisma.student.count({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  })

// Количество учеников без групп
export const getStudentsWithoutGroup = async () =>
  await prisma.student.count({
    where: {
      groups: {
        none: {},
      },
    },
  })

// Общая сумма платежей за текущий месяц
export const getTotalPayments = async () =>
  await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      createdAt: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    },
  })
