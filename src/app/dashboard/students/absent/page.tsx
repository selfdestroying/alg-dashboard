import { AbsentAttendanceTable } from '@/components/tables/absent-attendance-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import prisma from '@/lib/prisma'

export default async function Page() {
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
    <Card>
      <CardHeader>
        <CardTitle>Пропустившие ученики</CardTitle>
      </CardHeader>
      <CardContent>
        <AbsentAttendanceTable attendance={attendance} />
      </CardContent>
    </Card>
  )
}
