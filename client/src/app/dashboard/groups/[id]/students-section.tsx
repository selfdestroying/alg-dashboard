import { apiGet } from '@/actions/api'
import GroupStudentsTable from '@/components/tables/group-students-table'
import StudentsTable from '@/components/tables/students-table'
import { Card, CardHeader } from '@/components/ui/card'
import { IGroup } from '@/types/group'
import { ApiResponse } from '@/types/response'
import { IStudent } from '@/types/student'
import { group } from 'console'

export default async function StudentsSection({
  group,
  students,
}: {
  group: IGroup
  students: ApiResponse<IStudent[]>
}) {
  if (!students.success) {
    return (
      <Card>
        <CardHeader className="justify-center gap-0">
          Ошибка при получении студентов: {students.message}
        </CardHeader>
      </Card>
    )
  }
  return (
    <GroupStudentsTable
      group={group}
      studentsNotInGroup={students.data.filter((s) => !group.students.some((gs) => gs.id === s.id))}
    />
  )
}
