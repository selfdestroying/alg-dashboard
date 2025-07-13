import { apiGet } from '@/actions/api'
import { getUser } from '@/actions/auth'
import GroupDialog from '@/components/dialogs/group-dialog'
import GroupsTable from '@/components/tables/groups-table'
import { IGroup } from '@/types/group'
import { redirect } from 'next/navigation'

export default async function Page() {
  const user = await getUser()
  if (!user) {
    redirect('/auth')
  }
  const groups = await apiGet<IGroup[]>('groups')
  if (!groups.success) {
    console.log(groups.message)
    return <div>{groups.message}</div>
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <GroupDialog />
      </div>
      <div>
        <GroupsTable groups={groups.data} user={user} />
      </div>
    </>
  )
}
