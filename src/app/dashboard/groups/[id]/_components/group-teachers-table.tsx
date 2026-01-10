'use client'
import { getGroup } from '@/actions/groups'
import { UserData } from '@/actions/users'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { useData } from '@/providers/data-provider'
import { Prisma } from '@prisma/client'
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  TableOptions,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { useState } from 'react'
import BalanceBadge from '../../../lessons/[id]/_components/balance-badge'
import GroupTeacherActions from './group-teachers-actions'

export type Teacher = { teacher: UserData } & {
  teacherId: number
  groupId: number
}

interface GroupTeachersTableProps {
  group: Awaited<ReturnType<typeof getGroup>>
}
export default function GroupTeachersTable({ group }: GroupTeachersTableProps) {
  const { user } = useData()
  const columns: ColumnDef<
    Prisma.TeacherGroupGetPayload<{
      include: {
        teacher: true
      }
    }>
  >[] = [
    {
      header: 'Имя',
      accessorFn: (row) => `${row.teacher.firstName} ${row.teacher.lastName || ''}`,
    },
    {
      header: 'Ставка за индив.',
      cell: ({ row }) => <BalanceBadge balance={row.original.bid} />,
    },
    {
      id: 'actions',
      cell: ({ row }) => <GroupTeacherActions tg={row.original} />,
      size: 50,
    },
  ]

  return (
    <DataTable
      data={group.teachers}
      columns={columns}
      defaultColumnVisibility={{
        actions: user?.role === 'ADMIN' || user?.role === 'OWNER',
      }}
    />
  )
}

interface DataObject {
  [key: string]: Exclude<unknown, undefined>
}

interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  defaultFilters?: ColumnFiltersState
  defaultSorting?: SortingState
  defaultColumnVisibility?: VisibilityState
  defaultPagination?: PaginationState
  tableOptions?: Partial<TableOptions<T>>
}

function DataTable<T extends DataObject>({ data, columns, tableOptions }: DataTableProps<T>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedRowModel: getFacetedRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    ...tableOptions,
  })

  return (
    <div className="w-full space-y-2">
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} style={{ width: `${header.getSize()}px` }}>
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <div
                          className={cn(
                            header.column.getCanSort() &&
                              'flex cursor-pointer items-center gap-2 select-none'
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                          onKeyDown={(e) => {
                            // Enhanced keyboard handling for sorting
                            if (
                              header.column.getCanSort() &&
                              (e.key === 'Enter' || e.key === ' ')
                            ) {
                              e.preventDefault()
                              header.column.getToggleSortingHandler()?.(e)
                            }
                          }}
                          tabIndex={header.column.getCanSort() ? 0 : undefined}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: (
                              <ArrowUp
                                className="shrink-0 opacity-60"
                                size={16}
                                aria-hidden="true"
                              />
                            ),
                            desc: (
                              <ArrowDown
                                className="shrink-0 opacity-60"
                                size={16}
                                aria-hidden="true"
                              />
                            ),
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="overflow-hidden">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
