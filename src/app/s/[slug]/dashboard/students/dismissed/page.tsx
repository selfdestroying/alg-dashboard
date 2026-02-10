import { getDismissedStatistics } from '@/src/actions/dismissed'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { auth } from '@/src/lib/auth'
import { withRLS } from '@/src/lib/rls'
import { protocol, rootDomain } from '@/src/lib/utils'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import DismissedStudentsTable from './_components/dismissed-table'
import DismissedStatistics from './statistics/dismissed-statistics'

export default async function Page() {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({
    headers: requestHeaders,
  })
  if (!session) {
    redirect(`${protocol}://auth.${rootDomain}/sign-in`)
  }
  const orgId = session.members[0].organizationId
  const dismissed = await withRLS(orgId, (tx) =>
    tx.dismissed.findMany({
      where: {
        organizationId: orgId,
      },
      include: {
        group: {
          include: { course: true, location: true, teachers: { include: { teacher: true } } },
        },
        student: true,
      },
      orderBy: { date: 'desc' },
    })
  )

  const statistics = await getDismissedStatistics(orgId)

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-2">
      <DismissedStatistics {...statistics} />
      <Card>
        <CardHeader>
          <CardTitle>Ученики</CardTitle>
          <CardDescription>Список всех отчисленных учеников</CardDescription>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <DismissedStudentsTable data={dismissed} />
        </CardContent>
      </Card>
    </div>
  )
}
