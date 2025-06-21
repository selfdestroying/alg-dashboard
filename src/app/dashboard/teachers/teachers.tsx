import { ITeacher } from '@/types/user'
import { ColumnDef } from '@tanstack/react-table'

export const columns: ColumnDef<ITeacher>[] = [
  {
    accessorKey: 'username',
    header: 'username',
  },
  {
    accessorKey: 'role',
    header: 'Role',
  },
]
