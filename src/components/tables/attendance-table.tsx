'use client'
import React, { useId, useMemo, useRef, useState } from 'react'

import { AttendanceWithStudents, updateAttendance } from '@/actions/attendance'
import { LessonWithAttendanceAndGroup } from '@/actions/lessons'
import { cn } from '@/lib/utils'
import { Attendance, AttendanceStatus } from '@prisma/client'
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, CircleX, Funnel, Search } from 'lucide-react'
import { toast } from 'sonner'
import ButtonDialog from '../button-dialog'
import MakeUpForm from '../forms/makeup-form'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Pagination, PaginationContent, PaginationItem } from '../ui/pagination'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'

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
  setData: React.Dispatch<React.SetStateAction<AttendanceWithStudents[]>>,
  skipAutoResetPageIndex: () => void,
  upcomingLessons: LessonWithAttendanceAndGroup[]
): ColumnDef<AttendanceWithStudents>[] => [
  {
    header: 'Полное имя',
    accessorKey: 'fullName',
    accessorFn: (value) => `${value.student.firstName} ${value.student.lastName}`,
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="flex flex-wrap gap-2 font-medium">
          {row.original.student.firstName} {row.original.student.lastName}
          {row.original.asMakeupFor && (
            <Badge variant={'outline'}>
              Отработка за{' '}
              {row.original.asMakeupFor.missedAttendance.lesson!.date.toLocaleDateString('ru', {
                year: '2-digit',
                month: '2-digit',
                day: '2-digit',
              })}
            </Badge>
          )}
        </div>
      </div>
    ),
    enableHiding: false,
  },
  {
    header: 'Статус',
    accessorKey: 'status',
    cell: ({ row }) => (
      <div className="flex flex-wrap items-center gap-2">
        <StatusAction
          value={row.original}
          onChange={(val: AttendanceStatus) => {
            skipAutoResetPageIndex()

            setData((prev) => {
              return prev.map((item) => {
                if (item.id === row.original.id) {
                  return {
                    ...item,
                    status: val,
                  }
                }
                return item
              })
            })
          }}
        />
        {row.original.asMakeupFor ? null : row.original.missedMakeup ? (
          <Badge variant={'outline'}>
            Отработка{' '}
            {row.original.missedMakeup.makeUpAttendance.lesson?.date.toLocaleDateString('ru', {
              year: '2-digit',
              month: '2-digit',
              day: '2-digit',
            })}
          </Badge>
        ) : (
          <ButtonDialog
            title="Назначить отработку"
            triggerButtonProps={{ variant: 'outline', size: 'sm' }}
            submitButtonProps={{ form: 'makeup-form' }}
          >
            <MakeUpForm
              upcomingLessons={upcomingLessons}
              studentId={row.original.studentId}
              missedAttendanceId={row.original.id}
            />
          </ButtonDialog>
        )}
      </div>
    ),
  },
  {
    header: 'Комментарий',
    accessorKey: 'comment',
    cell: ({ row, getValue }) => (
      <CommentAction
        value={getValue() as string}
        onChange={(val: string) => {
          skipAutoResetPageIndex()
          setData((prev) => {
            return prev.map((item) => {
              if (item.id === row.original.id) {
                return {
                  ...item,
                  comment: val,
                }
              }
              return item
            })
          })
        }}
      />
    ),
  },
]

export function AttendanceTable({
  attendance,
  upcomingLessons,
}: {
  attendance: AttendanceWithStudents[]
  upcomingLessons: LessonWithAttendanceAndGroup[]
}) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  const [data, setData] = React.useState<AttendanceWithStudents[]>(() => attendance)
  const [editedData, setEditedData] = useState<AttendanceWithStudents[]>(attendance)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [sorting, setSorting] = useState<SortingState>([{ id: 'fullName', desc: false }])

  const isModified = useMemo(() => {
    return editedData.some((item, i) => {
      const original = data[i]
      return item.status !== original.status || item.comment !== original.comment
    })
  }, [data, editedData])

  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper()
  const columns = useMemo<ColumnDef<AttendanceWithStudents>[]>(
    () => getColumns(setEditedData, skipAutoResetPageIndex, upcomingLessons),
    []
  )

  const table = useReactTable({
    data: editedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
    },
    autoResetPageIndex,
  })

  // Extract complex expressions into separate variables
  const statusColumn = table.getColumn('status')
  const statusFacetedValues = statusColumn?.getFacetedUniqueValues()
  const statusFilterValue = statusColumn?.getFilterValue()

  // Update useMemo hooks with simplified dependencies
  const uniqueStatusValues = useMemo(() => {
    if (!statusColumn) return []
    const values = Array.from(statusFacetedValues?.keys() ?? [])
    return values.sort()
  }, [statusColumn, statusFacetedValues])

  const statusCounts = useMemo(() => {
    if (!statusColumn) return new Map()
    return statusFacetedValues ?? new Map()
  }, [statusColumn, statusFacetedValues])

  const selectedStatuses = useMemo(() => {
    return (statusFilterValue as string[]) ?? []
  }, [statusFilterValue])

  const handleStatusChange = (checked: boolean, value: string) => {
    const filterValue = table.getColumn('status')?.getFilterValue() as string[]
    const newFilterValue = filterValue ? [...filterValue] : []

    if (checked) {
      newFilterValue.push(value)
    } else {
      const index = newFilterValue.indexOf(value)
      if (index > -1) {
        newFilterValue.splice(index, 1)
      }
    }

    table.getColumn('status')?.setFilterValue(newFilterValue.length ? newFilterValue : undefined)
  }

  const handleSave = () => {
    const ok = updateAttendance(editedData).then(() => setData(editedData))
    toast.promise(ok, {
      loading: 'Загрузка...',
      success: 'Посещаемость успешно обновлена',
      error: (e) => e.message,
    })
  }

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Left side */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Input
                id={`${id}-input`}
                ref={inputRef}
                className={cn(
                  'peer min-w-60 bg-gradient-to-br ps-9',
                  Boolean(table.getColumn('fullName')?.getFilterValue()) && 'pe-9'
                )}
                value={(table.getColumn('fullName')?.getFilterValue() ?? '') as string}
                onChange={(e) => table.getColumn('fullName')?.setFilterValue(e.target.value)}
                placeholder="Search by name"
                type="text"
                aria-label="Search by name"
              />
              <div className="text-muted-foreground/60 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 peer-disabled:opacity-50">
                <Search size={20} aria-hidden="true" />
              </div>
              {Boolean(table.getColumn('fullName')?.getFilterValue()) && (
                <button
                  className="text-muted-foreground/60 hover:text-foreground focus-visible:outline-ring/70 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg outline-offset-2 transition-colors focus:z-10 focus-visible:outline-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Clear filter"
                  onClick={() => {
                    table.getColumn('fullName')?.setFilterValue('')
                    if (inputRef.current) {
                      inputRef.current.focus()
                    }
                  }}
                >
                  <CircleX size={16} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
          {/* Right side */}
          <div className="flex items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Funnel
                    className="text-muted-foreground/60 -ms-1.5 size-5"
                    size={20}
                    aria-hidden="true"
                  />
                  Статус
                  {selectedStatuses.length > 0 && (
                    <span className="border-border bg-background text-muted-foreground/70 ms-3 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
                      {selectedStatuses.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto min-w-36 p-3" align="end">
                <div className="space-y-3">
                  <div className="space-y-3">
                    {uniqueStatusValues.map((value, i) => (
                      <div key={value} className="flex items-center gap-2">
                        <Checkbox
                          id={`${id}-${i}`}
                          checked={selectedStatuses.includes(value)}
                          onCheckedChange={(checked: boolean) => handleStatusChange(checked, value)}
                        />
                        <Label
                          htmlFor={`${id}-${i}`}
                          className="flex grow justify-between gap-2 font-normal"
                        >
                          {value}{' '}
                          <span className="text-muted-foreground ms-2 text-xs">
                            {statusCounts.get(value)}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <Button disabled={!isModified} onClick={handleSave}>
          Сохранить
        </Button>
      </div>

      {/* Table */}
      <Table className="table-fixed border-separate border-spacing-0 [&_tr:not(:last-child)_td]:border-b">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    style={{ width: `${header.getSize()}px` }}
                    className="bg-sidebar border-border relative h-9 border-y select-none first:rounded-l-lg first:border-l last:rounded-r-lg last:border-r"
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <div
                        className={cn(
                          header.column.getCanSort() &&
                            'flex h-full cursor-pointer items-center gap-2 select-none'
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
                className="data-[state=selected]:bg-accent/50 hover:bg-accent/50 h-px border-0 [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="h-[inherit] last:py-0">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="data-[state=selected]:bg-accent/50 hover:bg-transparent [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <tbody aria-hidden="true" className="table-row h-1"></tbody>
      </Table>

      {/* Pagination */}
      {table.getRowModel().rows.length > 0 && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-muted-foreground flex-1 text-sm whitespace-nowrap" aria-live="polite">
            Страница{' '}
            <span className="text-foreground">{table.getState().pagination.pageIndex + 1}</span> из{' '}
            <span className="text-foreground">{table.getPageCount()}</span>
          </p>
          <Pagination className="w-auto">
            <PaginationContent className="gap-3">
              <PaginationItem>
                <Button
                  variant="outline"
                  className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Go to previous page"
                >
                  Назад
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  variant="outline"
                  className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Go to next page"
                >
                  Далее
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}

const StatusMap: { [key in AttendanceStatus]: string } = {
  ABSENT: 'Пропустил',
  PRESENT: 'Пришел',
  UNSPECIFIED: 'Не отмечен',
}

function StatusAction({
  value,
  onChange,
}: {
  value: Attendance
  onChange: (val: AttendanceStatus) => void
}) {
  return (
    <Select
      value={value.status != 'UNSPECIFIED' ? value.status : undefined}
      onValueChange={(e: AttendanceStatus) => onChange(e)}
    >
      <SelectTrigger size="sm" className="">
        <SelectValue placeholder={StatusMap['UNSPECIFIED']} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={AttendanceStatus.PRESENT}>
          <div className="bg-success size-2 rounded-full" aria-hidden="true"></div>
          {StatusMap.PRESENT}
        </SelectItem>
        <SelectItem value={AttendanceStatus.ABSENT}>
          <div className="bg-error size-2 rounded-full" aria-hidden="true"></div>
          {StatusMap.ABSENT}
        </SelectItem>
      </SelectContent>
    </Select>
  )
}

function CommentAction({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  return <Input value={value} onChange={(e) => onChange(e.target.value)} />
}
