import { getAbsentStatistics } from '@/actions/attendance'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import AbsentAttendanceTable from './_components/absent-attendance-table'
import AbsentStatistics from './statistics/absent-statistics'

export default async function Page() {
  const stats = await getAbsentStatistics()

  // Выбираем пропуски:
  // 1. Обычные пропуски без отработки
  // 2. Пропуски отработок
  // Исключаем пропуски, для которых была назначена отработка (независимо от её статуса)
  const attendance = await prisma.attendance.findMany({
    where: {
      status: 'ABSENT',
      OR: [
        // Обычные пропуски без отработки (не является отработкой)
        {
          AND: [{ missedMakeup: { is: null } }, { asMakeupFor: { is: null } }],
        },
        // Пропуски отработок (сама отработка была пропущена)
        { asMakeupFor: { isNot: null } },
      ],
    },
    include: {
      student: true,
      lesson: {
        include: {
          group: true,
        },
      },
      asMakeupFor: { include: { missedAttendance: { include: { lesson: true } } } },
      missedMakeup: { include: { makeUpAttendance: { include: { lesson: true } } } },
    },
    orderBy: [{ lesson: { date: 'desc' } }],
  })

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-2">
      <AbsentStatistics {...stats} />
      <Card>
        <CardHeader>
          <CardTitle>Ученики</CardTitle>
          <CardDescription>Список всех учеников системы</CardDescription>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <AbsentAttendanceTable data={attendance} />
        </CardContent>
      </Card>
    </div>
  )
}
