'use server'
import { prisma } from '@/lib/prisma'

export const getStatistics = async (userId: number) => {
  const totalStudents = await prisma.student.count()
  const totalGroups = await prisma.group.count()

  const totalPersonalGroups = await prisma.group.count({
    where:
      userId == -1
        ? {}
        : {
            teachers: { some: { teacherId: userId } },
          },
  })
  const totalPersonalStudents = await prisma.student.count({
    where:
      userId == -1
        ? {}
        : {
            groups: {
              some: {
                group: {
                  teachers: { some: { teacherId: userId } },
                },
              },
            },
          },
  })
  return {
    totalStudents,
    totalGroups,
    totalPersonalGroups,
    totalPersonalStudents,
  }
}
