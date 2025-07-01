import DataTable from '@/components/ui/data-table'
import { IUser } from '@/types/user'
import { columns } from './teachers'

export default async function Page() {
  let users: IUser[]
  try {
    const res = await fetch(`${process.env.API_URL}/teachers`)
    users = await res.json()
  } catch {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teachers`)
      users = await res.json()
    } catch {
      users = []
    }
  }
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
