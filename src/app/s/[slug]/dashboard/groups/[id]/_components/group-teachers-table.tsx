'use client'
import { Prisma } from '@/prisma/generated/client'
import DataTable from '@/src/components/data-table'
import { useOrganizationPermissionQuery } from '@/src/data/organization/organization-permission-query'
import { getFullName } from '@/src/lib/utils'
import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import Link from 'next/link'
import { useMemo } from 'react'
import BalanceBadge from '../../../lessons/[id]/_components/balance-badge'
import GroupTeacherActions from './group-teachers-actions'

export default function GroupTeachersTable({
  data,
}: {
  data: Prisma.TeacherGroupGetPayload<{ include: { teacher: true } }>[]
}) {
  const canEdit = useOrganizationPermissionQuery({ teacherGroup: ['update'] })
  const columns: ColumnDef<Prisma.TeacherGroupGetPayload<{ include: { teacher: true } }>>[] =
    useMemo(
      () => [
        {
          header: 'Преподаватель',
          cell: ({ row }) => (
            <Link
              href={`/dashboard/users/${row.original.teacher.id}`}
              className="text-primary hover:underline"
            >
              {getFullName(row.original.teacher.firstName, row.original.teacher.lastName)}
            </Link>
          ),
        },
        {
          header: 'Ставка',
          cell: ({ row }) => <BalanceBadge balance={row.original.bid} />,
        },
        {
          id: 'actions',
          cell: ({ row }) => (canEdit ? <GroupTeacherActions tg={row.original} /> : null),
        },
      ],
      [canEdit]
    )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return <DataTable table={table} emptyMessage="Нет преподавателей." />
}
