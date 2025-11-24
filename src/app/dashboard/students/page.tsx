import { getGroups } from '@/actions/groups'
import { getStudents } from '@/actions/students'
import FormDialog from '@/components/button-dialog'
import StudentForm from '@/components/forms/student-form'
import { StudentsTable } from '@/components/tables/students-table'

export default async function Page() {
  const students = await getStudents({})
  const groups = await getGroups()

  return (
    <>
      <div className="flex items-center gap-2">
        <FormDialog
          title="Добавить ученика"
          submitButtonProps={{ form: 'student-form' }}
          FormComponent={StudentForm}
          formComponentProps={{
            type: 'create',
            groups,
            defaultValues: {
              firstName: '',
              lastName: '',
              age: 0,
              parentsName: '',
              crmUrl: '',
            },
          }}
        />
      </div>
      <div>
        <StudentsTable data={students} />
      </div>
    </>
  )
}
