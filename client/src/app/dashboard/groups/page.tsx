import { getGroups } from '@/actions/groups'
import { getUser } from '@/actions/users'
import GroupDialog from '@/components/dialogs/group-dialog'
import GroupsTable from '@/components/tables/groups-table'
import { redirect } from 'next/navigation'

export default async function Page() {
  const user = await getUser()
  if (!user) {
    redirect('/auth')
  }
  const groups = await getGroups()

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <GroupDialog />
      </div>
      <div>
        <GroupsTable groups={groups} user={user} />
      </div>
    </>
  )
}
