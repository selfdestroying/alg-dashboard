'use client'

import { IStudent } from '@/types/student'
import { ColumnDef } from '@tanstack/react-table'
import { Actions, ActionsInGroup } from './student-actions'
import DataTable from '../ui/data-table'

export default function StudentTable({
  data,
  isAuthenticated,
  inGroup,
}: {
  data: IStudent[]
  isAuthenticated: boolean
  inGroup: boolean
}) {
  const columns: ColumnDef<IStudent>[] = [
    {
      accessorKey: 'name',
      header: 'Имя',
    },
    {
      accessorKey: 'age',
      header: 'Возраст',
    },
    {
      id: 'actions',
      cell: ({ row }) =>
        isAuthenticated ? (
          inGroup ? (
            <ActionsInGroup student={row.original} />
          ) : (
            <Actions student={row.original} />
          )
        ) : (
          <></>
        ),
    },
  ]

  return <DataTable columns={columns} data={data} pageSize={0} />
}
