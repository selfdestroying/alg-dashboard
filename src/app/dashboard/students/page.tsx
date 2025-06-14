import { columns, IStudents } from '@/app/dashboard/students/students'
import DataTable from './data-table'

export default async function Page() {
  const res = await fetch('http://localhost:5120/api/students')
  const students: IStudents[] = await res.json()

  return (
    <div className="container p-10">
      <DataTable columns={columns} data={students} />
    </div>
  )
}
