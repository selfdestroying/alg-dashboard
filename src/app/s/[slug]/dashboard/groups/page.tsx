import { getGroups } from '@/src/actions/groups'

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { auth } from '@/src/lib/auth'
import { protocol, rootDomain } from '@/src/lib/utils'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import CreateGroupDialog from './_components/create-group-dialog'
import GroupsTable from './_components/groups-table'

export default async function Page() {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({
    headers: requestHeaders,
  })
  if (!session || !session.organizationId) {
    redirect(`${protocol}://auth.${rootDomain}/sign-in`)
  }
  const groups = await getGroups({
    where: { organizationId: session.organizationId! },
    include: {
      students: true,
      teachers: {
        include: {
          teacher: true,
        },
      },
      location: true,
      course: true,
    },
  })

  const { success: canCreate } = await auth.api.hasPermission({
    headers: requestHeaders,
    body: {
      permission: { group: ['create'] },
    },
  })

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1">
      <Card>
        <CardHeader>
          <CardTitle>Группы</CardTitle>
          <CardDescription>Список всех групп системы</CardDescription>
          {canCreate && (
            <CardAction>
              <CreateGroupDialog />
            </CardAction>
          )}
        </CardHeader>
        <CardContent className="overflow-hidden">
          <GroupsTable data={groups} />
        </CardContent>
      </Card>
    </div>
  )
}
