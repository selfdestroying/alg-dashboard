import DataTable from '@/components/ui/data-table'
import { IUser } from '@/types/user'
import { columns } from './teachers'

export default async function Page() {
  const res = await fetch('http://localhost:5120/api/teachers')
  const users: IUser[] = await res.json()
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Учителя</h1>
        </div>
      </div>
      <DataTable columns={columns} data={users} />
    </div>
  )
}
