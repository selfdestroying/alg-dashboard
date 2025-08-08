// components/StatsCards.tsx
import { getUser } from '@/actions/users'
import prisma from '@/lib/prisma'

export async function StatsCards() {
  const user = await getUser()
  const totalStudents = await prisma.student.count()
  const totalGroups = await prisma.group.count()

  const totalPersonalGroups = await prisma.group.count({
    where: {
      teacherId: user?.id,
    },
  })
  const totalPersonalStudents = await prisma.student.count({
    where: {
      groups: {
        some: {
          group: {
            teacherId: user?.id,
          },
        },
      },
    },
  })

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <div className="rounded-lg border p-2 text-xs shadow-xs">
        Количество учеников (мои/всего): {totalPersonalStudents}/{totalStudents}
      </div>
      <div className="rounded-lg border p-2 text-xs shadow-xs">
        Количество групп (мои/всего): {totalPersonalGroups}/{totalGroups}
      </div>
    </div>
  )
}
