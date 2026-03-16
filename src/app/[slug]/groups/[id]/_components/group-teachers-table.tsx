'use client'
import { Prisma } from '@/prisma/generated/client'
import DataTable from '@/src/components/data-table'
import { Hint } from '@/src/components/hint'
import { useOrganizationPermissionQuery } from '@/src/data/organization/organization-permission-query'
import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import Link from 'next/link'
import { useMemo } from 'react'
import BalanceBadge from '../../../lessons/[id]/_components/balance-badge'
import GroupTeacherActions from './group-teachers-actions'

type TeacherGroupWithRate = Prisma.TeacherGroupGetPayload<{
  include: { teacher: true; rate: true }
}>

function GroupTeacherActionsCell({ tg }: { tg: TeacherGroupWithRate }) {
  const { data: canEdit } = useOrganizationPermissionQuery({ teacherGroup: ['update'] })
  if (!canEdit?.success) return null
  return <GroupTeacherActions tg={tg} />
}

export default function GroupTeachersTable({
  data,
  isArchived,
}: {
  data: TeacherGroupWithRate[]
  isArchived?: boolean
}) {
  const columns: ColumnDef<TeacherGroupWithRate>[] = useMemo(
    () => [
      {
        header: 'Преподаватель',
        cell: ({ row }) => (
          <Link
            href={`/organization/members/${row.original.teacher.id}`}
            className="text-primary hover:underline"
          >
            {row.original.teacher.name}
          </Link>
        ),
      },
      {
        header: 'Ставка',
        cell: ({ row }) => <BalanceBadge balance={row.original.rate.bid} />,
      },
      {
        id: 'bonusPerStudent',
        header: () => (
          <span className="flex items-center gap-0.5">
            Бонус за уч.
            <Hint text="Доплата преподавателю за каждого присутствующего ученика. Итого за урок = ставка + (бонус × кол-во учеников)." />
          </span>
        ),
        cell: ({ row }) => <BalanceBadge balance={row.original.rate.bonusPerStudent} />,
      },
      {
        id: 'actions',
        cell: ({ row }) => !isArchived && <GroupTeacherActionsCell tg={row.original} />,
      },
    ],
    [isArchived],
  )
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return <DataTable table={table} emptyMessage="Нет преподавателей." />
}
