import DataTable from '@/components/data-table'
import { columns, IGroups } from './groups'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

      <DataTable
        columns={columns}
        data={groups}
        addButton={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        }
      />
    </div>
  )
}
