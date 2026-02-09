import { getAbsentStatistics } from '@/src/actions/attendance'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { auth } from '@/src/lib/auth'
import prisma from '@/src/lib/prisma'
import { protocol, rootDomain } from '@/src/lib/utils'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import AbsentAttendanceTable from './_components/absent-attendance-table'
import AbsentStatistics from './statistics/absent-statistics'

export default async function Page() {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({
    headers: requestHeaders,
  })
  if (!session) {
    redirect(`${protocol}://auth.${rootDomain}/sign-in`)
  }
  const stats = await getAbsentStatistics(session.members[0].organizationId)

  const attendance = await prisma.attendance.findMany({
    where: {
      organizationId: session.members[0].organizationId,
      status: 'ABSENT',
      OR: [
        {
          AND: [{ missedMakeup: { is: null } }, { asMakeupFor: { is: null } }],
        },
        { asMakeupFor: { isNot: null } },
      ],
      student: {
        dismisseds: { none: {} },
      },
    },
    include: {
      student: true,
      lesson: {
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
