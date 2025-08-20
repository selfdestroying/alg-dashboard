import { AllGroupData } from '@/actions/groups'
import FormDialog from '@/components/button-dialog'
import { GroupStudentForm } from '@/components/forms/group-student-form'
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
      <FormDialog
        title="Добавить ученика"
        FormComponent={GroupStudentForm}
        formComponentProps={{
          groupId: group.id,
          students: students,
        }}
        submitButtonProps={{
          form: 'group-student-form',
        }}
      />
      <GroupStudentsTable data={group} />
    </>
  )
}
