import { columns } from '@/app/dashboard/students/students'
import DataTable from '@/components/ui/data-table'
import StudentDialog from '@/components/students/student-dialog'
import { IStudent } from '@/types/student'
import { api } from '@/lib/api/api-client'

export default async function Page() {
  const students = await api.get<IStudent[]>('students')

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Students</h1>
          <p className="text-muted-foreground">Manage student records and group assignments</p>
        </div>
      </div>
      {students.success ? (
        <DataTable columns={columns} data={students.data} addButton={<StudentDialog />} />
      ) : (
        <div>{students.message}</div>
      )}
    </div>
  )
}
