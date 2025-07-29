import { AllGroupData } from '@/actions/groups'
import GroupStudentsTable from '@/components/tables/group-students-table'
import { Student } from '@prisma/client'

export default async function StudentsSection({
  group,
  students,
}: {
  group: AllGroupData
  students: Student[]
}) {
  return (
    <GroupStudentsTable
      group={group}
      studentsNotInGroup={students.filter((s) => !group.students.some((gs) => gs.id === s.id))}
    />
  )
}
