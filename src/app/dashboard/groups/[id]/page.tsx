import DataTable from '@/components/data-table'
import { IGroup } from '../groups'
import { columns } from '../../students/students'
import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function GroupDetail({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id
  const res = await fetch(`http://localhost:5120/api/groups/${id}`)
  const group: IGroup = await res.json()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{group.name}</h1>
          <p className="text-muted-foreground">Manage student records and group assignments</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={group.students}
        addButton={
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        }
      />
    </div>
  )
}
