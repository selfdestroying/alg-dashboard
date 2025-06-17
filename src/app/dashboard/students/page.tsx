import { columns } from '@/app/dashboard/students/students'
import DataTable from '@/components/data-table'
import { IStudent } from '@/types/student'
import StudentDialog from '../../../components/student-dialog'

export default async function Page() {
  const res = await fetch('http://localhost:5120/api/students')
  const students: IStudent[] = await res.json()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Students</h1>
          <p className="text-muted-foreground">Manage student records and group assignments</p>
        </div>
      </div>

      <DataTable columns={columns} data={students} addButton={<StudentDialog />} />
    </div>
  )
}
