import { getGroups } from '@/actions/groups'

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import CreateGroupDialog from './_components/create-group-dialog'
import GroupsTable from './_components/groups-table'

export default async function Page() {
  const groups = await getGroups({
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

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1">
      <Card>
        <CardHeader>
          <CardTitle>Группы</CardTitle>
          <CardDescription>Список всех групп системы</CardDescription>
          <CardAction>
            <CreateGroupDialog />
          </CardAction>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <GroupsTable data={groups} />
        </CardContent>
      </Card>
    </div>
  )
}
