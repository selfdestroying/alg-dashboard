import { apiGet } from '@/actions/api'
import { getStudents } from '@/actions/students'
import StudentDialog from '@/components/dialogs/student-dialog'
import StudentsTable from '@/components/tables/students-table'
import { IStudent } from '@/types/student'

export default async function Page() {
  const students = await getStudents()

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <StudentDialog />
      </div>
      <div>
        <StudentsTable students={students} />
      </div>
    </>
  )
}
