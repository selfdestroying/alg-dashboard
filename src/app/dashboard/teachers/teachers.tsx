import { IUser } from '@/types/user'
import { ColumnDef } from '@tanstack/react-table'

export const columns: ColumnDef<IUser>[] = [
  {
    accessorKey: 'username',
    header: 'Имя',
  },
  {
    accessorKey: 'role',
    header: 'Роль',
  },
]
