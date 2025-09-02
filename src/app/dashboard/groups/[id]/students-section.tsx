import { AllGroupData } from '@/actions/groups'
import { GroupStudentDialog } from '@/components/group-student-dialog'
import { GroupStudentsTable } from '@/components/tables/group-students-table'
import { Student } from '@prisma/client'

export default async function StudentsSection({
  group,
  students,
}: {
  group: AllGroupData
  students: (Student & { _count: { groups: number } })[]
}) {
  return (
    <>
      <GroupStudentDialog students={students} groupId={group.id} />
      <GroupStudentsTable data={group} />
    </>
  )
}
