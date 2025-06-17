import DataTable from '@/components/data-table'
import { columns } from './groups'
import { IGroups } from '@/types/group'
import GroupDialog from '@/components/group-dialog'

export default async function Page() {
  const res = await fetch('http://localhost:5120/api/groups')

  const groups: IGroups[] = await res.json()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Groups</h1>
          <p className="text-muted-foreground">Manage student groups and their capacity</p>
        </div>
      </div>

      <DataTable columns={columns} data={groups} addButton={<GroupDialog />} />
    </div>
  )
}
