import DataTable from '@/components/ui/data-table'
import { columnsInGroup } from '../../students/students'
import { IGroup } from '@/types/group'
import { Badge } from '@/components/ui/badge'
import StudentGroupDialog from '@/components/student-group-dialog'
import { getStudentsExcludeGroup } from '@/actions/students'

export default async function GroupDetail({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id
  const groupRes = await fetch(`http://localhost:5120/api/groups/${id}`)
  const group: IGroup = (await groupRes.json()).data
  const students = await getStudentsExcludeGroup(+id)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{group.name}</h1>
          <Badge variant={'secondary'}>{group.course}</Badge>
        </div>
      </div>

      <DataTable
        columns={columnsInGroup}
        data={group.students}
        addButton={<StudentGroupDialog students={students} groupId={id} />}
      />
    </div>
  )
}
