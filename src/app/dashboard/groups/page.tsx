import DataTable from '@/components/ui/data-table'
import { columns } from './groups'
import GroupDialog from '@/components/group/group-dialog'
import { IGroup } from '@/types/group'
import { api } from '@/lib/api/api-client'

export default async function Page() {
  const groups = await api.get<IGroup[]>('groups')

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Groups</h1>
          <p className="text-muted-foreground">Manage student groups and their capacity</p>
        </div>
      </div>
      {groups.success ? (
        <DataTable columns={columns} data={groups.data} addButton={<GroupDialog />} />
      ) : (
        <div>{groups.message}</div>
      )}
    </div>
  )
}
