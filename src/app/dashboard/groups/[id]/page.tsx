import DataTable from '@/components/ui/data-table'
import { columnsInGroup } from '../../students/students'
import { IGroup } from '@/types/group'
import { Badge } from '@/components/ui/badge'
import StudentGroupDialog from '@/components/student-group-dialog'
import { api } from '@/lib/api/api-client'
import { IStudent } from '@/types/student'

export default async function GroupDetail({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id
  const group = await api.get<IGroup>(`groups/${id}`)

  if (!group.success) {
    return <div>Error</div>
  }
  const studentsExcludeInGroup = await api.get<IStudent[]>(`students?groupId=${id}`)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{group.data.name}</h1>
          <Badge variant={'secondary'}>{group.data.course}</Badge>
        </div>
      </div>

      {studentsExcludeInGroup.success ? (
        <DataTable
          columns={columnsInGroup}
          data={group.data.students}
          addButton={<StudentGroupDialog students={studentsExcludeInGroup.data} groupId={id} />}
        />
      ) : (
        <div>Error</div>
      )}
    </div>
  )
}
