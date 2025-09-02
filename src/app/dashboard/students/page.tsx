import { getStudents } from '@/actions/students'
import FormDialog from '@/components/button-dialog'
import StudentForm from '@/components/forms/student-form'
import { StudentsTable } from '@/components/tables/students-table'

export default async function Page() {
  const students = await getStudents()

  return (
    <>
      <div className="flex items-center gap-2">
        <FormDialog
          title="Добавить ученика"
          submitButtonProps={{ form: 'student-form' }}
          FormComponent={StudentForm}
        />
      </div>
      <div>
        <StudentsTable data={students} />
      </div>
    </>
  )
}
