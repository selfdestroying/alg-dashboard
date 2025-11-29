'use client'
import React, { useMemo, useState } from 'react'

import { AttendanceWithStudents, updateAttendanceComment } from '@/actions/attendance'
import AttendanceActions from '@/components/attendance-actions'
import { AttendanceStatusSwitcher } from '@/components/attendance-status-switcher'
import { cn } from '@/lib/utils'
import { AttendanceStatus, StudentStatus } from '@prisma/client'
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  TableOptions,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table'
import { debounce, DebouncedFunction } from 'es-toolkit'
import { ArrowDown, ArrowUp } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'

const StudentStatusMap: { [key in StudentStatus]: string } = {
  ACTIVE: 'Ученик',
  DISMISSED: 'Отчислен',
  TRIAL: 'Пробный',
}

const AttendanceStatusVariantMap: { [key in AttendanceStatus]: 'success' | 'error' | 'outline' } = {
  PRESENT: 'success',
  ABSENT: 'error',
  UNSPECIFIED: 'outline',
}

function useSkipper() {
  const shouldSkipRef = React.useRef(true)
  const shouldSkip = shouldSkipRef.current

  // Wrap a function with this to skip a pagination reset temporarily
  const skip = React.useCallback(() => {
    shouldSkipRef.current = false
  }, [])

  React.useEffect(() => {
    shouldSkipRef.current = true
  })

  return [shouldSkip, skip] as const
}

const getColumns = (
  // setData: React.Dispatch<React.SetStateAction<AttendanceWithStudents[]>>,
  handleUpdate: DebouncedFunction<
    (studentId: number, lessonId: number, comment?: string, status?: AttendanceStatus) => void
  >
): ColumnDef<AttendanceWithStudents>[] => {
  return [
    {
      header: 'Полное имя',
      accessorKey: 'fullName',
      accessorFn: (value) => `${value.student.firstName} ${value.student.lastName}`,
      cell: ({ row }) => (
        <Button asChild variant={'link'} className="h-fit p-0 font-medium">
          <Link href={`/dashboard/students/${row.original.studentId}`}>
            {row.original.student.firstName} {row.original.student.lastName}
          </Link>
        </Button>
      ),
    },
    {
      header: 'Статус ученика',
      accessorKey: 'studentStatus',
      cell: ({ row }) => (
        <Badge variant={row.original.studentStatus === 'ACTIVE' ? 'success' : 'info'}>
          {StudentStatusMap[row.original.studentStatus]}
        </Badge>
      ),
    },
    {
      header: 'Статус',
      accessorKey: 'status',
      cell: ({ row }) => (
        <AttendanceStatusSwitcher
          lessonId={row.original.lessonId}
          studentId={row.original.studentId}
          status={row.original.status}
        />
      ),
    },
    {
      header: 'Отработка',
      cell: ({ row }) =>
        row.original.asMakeupFor ? (
          <Badge asChild variant={'info'}>
            <Link href={`/dashboard/lessons/${row.original.asMakeupFor.missedAttendance.lessonId}`}>
              Отработка за{' '}
              {row.original.asMakeupFor.missedAttendance.lesson!.date.toLocaleDateString('ru', {
                month: '2-digit',
                day: '2-digit',
              })}
            </Link>
          </Badge>
        ) : row.original.missedMakeup ? (
          <Badge
            asChild
            variant={AttendanceStatusVariantMap[row.original.missedMakeup.makeUpAttendance.status]}
          >
            <Link
              href={`/dashboard/lessons/${row.original.missedMakeup.makeUpAttendance.lessonId}`}
            >
              Отработка{' '}
              {row.original.missedMakeup.makeUpAttendance.lesson!.date.toLocaleDateString('ru', {
                month: '2-digit',
                day: '2-digit',
              })}
            </Link>
          </Badge>
        ) : null,
    },
    {
      header: 'Комментарий',
      accessorKey: 'comment',
      cell: ({ row }) => (
        <Input
          className="h-8"
          defaultValue={row.original.comment}
          onChange={(e) =>
            handleUpdate(row.original.studentId, row.original.lessonId, e.target.value)
          }
        />
      ),
    },
    {
      id: 'actions',
      header: 'Действия',
      cell: ({ row }) => <AttendanceActions attendance={row.original} />,
    },
  ]
}

export function AttendanceTable({ attendance }: { attendance: AttendanceWithStudents[] }) {
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper()
  const handleUpdate = useMemo(
    () =>
      debounce((studentId: number, lessonId: number, comment?: string) => {
        skipAutoResetPageIndex()
        const ok = updateAttendanceComment({
          where: {
            studentId_lessonId: {
              studentId: studentId,
              lessonId: lessonId,
            },
          },
          data: {
            comment,
          },
        })
        toast.promise(ok, {
          loading: 'Загрузка...',
          success: 'Успешно!',
          error: (e) => e.message,
        })
      }, 500),
    [skipAutoResetPageIndex]
  )
  const columns = getColumns(handleUpdate)

  return (
    <DataTable
      paginate={false}
      data={attendance}
      columns={columns}
      tableOptions={{
        autoResetPageIndex,
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
  paginate: boolean
  tableOptions?: Partial<TableOptions<T>>
}

function DataTable<T extends DataObject>({
  data,
  columns,
  defaultFilters = [],
  defaultSorting = [],
  defaultColumnVisibility = {},
  defaultPagination = {
    pageIndex: 0,
    pageSize: 10,
  },
  paginate,
  tableOptions,
}: DataTableProps<T>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(defaultFilters)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(defaultColumnVisibility)
  const [pagination, setPagination] = useState<PaginationState>(defaultPagination)

  const [sorting, setSorting] = useState<SortingState>(defaultSorting)

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    getPaginationRowModel: paginate ? getPaginationRowModel() : undefined,
    onPaginationChange: paginate ? setPagination : undefined,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedRowModel: getFacetedRowModel(),
    state: {
      sorting,
      pagination: paginate ? pagination : undefined,
      columnFilters,
      columnVisibility,
    },
    ...tableOptions,
  })

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table className="table-fixed border-separate border-spacing-0 [&_tr:not(:last-child)_td]:border-b">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    style={{ width: `${header.getSize()}px` }}
                    className="bg-sidebar relative border-b"
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <div
                        className={cn(
                          header.column.getCanSort() &&
                            'flex cursor-pointer items-center gap-2 select-none'
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                        onKeyDown={(e) => {
                          // Enhanced keyboard handling for sorting
                          if (header.column.getCanSort() && (e.key === 'Enter' || e.key === ' ')) {
                            e.preventDefault()
                            header.column.getToggleSortingHandler()?.(e)
                          }
                        }}
                        tabIndex={header.column.getCanSort() ? 0 : undefined}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: (
                            <ArrowUp className="shrink-0 opacity-60" size={16} aria-hidden="true" />
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
        <tbody aria-hidden="true" className="table-row h-1"></tbody>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className="hover:bg-accent/50 h-px border-0 [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="last:py-0">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <tbody aria-hidden="true" className="table-row h-1"></tbody>
      </Table>
    </div>
  )
}
