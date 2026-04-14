'use client'

import DataTable from '@/src/components/data-table'
import TableFilter, { type TableFilterItem } from '@/src/components/table-filter'
import { Button } from '@/src/components/ui/button'
import { Calendar } from '@/src/components/ui/calendar'
import { Input } from '@/src/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover'
import { Skeleton } from '@/src/components/ui/skeleton'
import { useMappedLocationListQuery } from '@/src/features/locations/queries'
import { useTableSearchParams } from '@/src/hooks/use-table-search-params'
import { formatDateOnly } from '@/src/lib/timezone'
import {
  ColumnDef,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from 'date-fns'
import { ru } from 'date-fns/locale'
import { Calendar as CalendarIcon, ChevronDown, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { useRentListQuery } from '../queries'
import type { RentWithLocation } from '../types'
import RentActions from './rent-actions'

const datePresets = [
  {
    label: 'Текущий месяц',
    getValue: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    }),
  },
  {
    label: 'Прошлый месяц',
    getValue: () => ({
      from: startOfMonth(subMonths(new Date(), 1)),
      to: endOfMonth(subMonths(new Date(), 1)),
    }),
  },
  {
    label: 'Текущая неделя',
    getValue: () => ({
      from: startOfWeek(new Date(), { weekStartsOn: 1 }),
      to: endOfWeek(new Date(), { weekStartsOn: 1 }),
    }),
  },
  {
    label: 'Прошлая неделя',
    getValue: () => ({
      from: startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }),
      to: endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }),
    }),
  },
]

export default function RentTable() {
  const { data: rents = [], isLoading, isError } = useRentListQuery()
  const { data: locations = [] } = useMappedLocationListQuery()

  const [selectedLocations, setSelectedLocations] = useState<TableFilterItem[]>([])
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  // Client-side filtering
  const filteredRents = useMemo(() => {
    let result = rents

    // Filter by location
    if (selectedLocations.length > 0) {
      const locationIds = new Set(selectedLocations.map((l) => Number(l.value)))
      result = result.filter((r) => locationIds.has(r.locationId))
    }

    // Filter by date range overlap
    if (dateRange?.from && dateRange?.to) {
      const filterFrom = dateRange.from.getTime()
      const filterTo = dateRange.to.getTime()
      result = result.filter((r) => {
        const rentStart = new Date(r.startDate).getTime()
        const rentEnd = new Date(r.endDate).getTime()
        return rentStart <= filterTo && rentEnd >= filterFrom
      })
    }

    return result
  }, [rents, selectedLocations, dateRange])

  const columns: ColumnDef<RentWithLocation>[] = useMemo(
    () => [
      {
        header: 'Локация',
        accessorFn: (row) => row.location.name,
        id: 'location',
      },
      {
        header: 'Период',
        id: 'period',
        accessorFn: (row) => new Date(row.startDate).getTime(),
        cell: ({ row }) => {
          const start = formatDateOnly(row.original.startDate, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
          const end = formatDateOnly(row.original.endDate, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
          return `${start} – ${end}`
        },
      },
      {
        header: 'Сумма',
        accessorKey: 'amount',
        cell: ({ row }) =>
          new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            maximumFractionDigits: 0,
          }).format(row.original.amount),
      },
      {
        header: 'Комментарий',
        accessorKey: 'comment',
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.comment || '—'}</span>
        ),
      },
      {
        id: 'actions',
        cell: ({ row }) => <RentActions rent={row.original} />,
      },
    ],
    [],
  )

  const { globalFilter, setGlobalFilter, pagination, setPagination, sorting, setSorting } =
    useTableSearchParams({
      search: true,
      pagination: true,
      sorting: true,
    })

  const table = useReactTable({
    data: filteredRents,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedRowModel: getFacetedRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      const searchValue = String(filterValue).toLowerCase()
      const locationName = row.original.location.name.toLowerCase()
      const comment = (row.original.comment ?? '').toLowerCase()
      return locationName.includes(searchValue) || comment.includes(searchValue)
    },
    onPaginationChange: setPagination,
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      globalFilter,
      pagination,
      sorting,
    },
  })

  const handlePresetSelect = (preset: (typeof datePresets)[0]) => {
    setDateRange(preset.getValue())
    setIsCalendarOpen(false)
  }

  const formatDateRange = () => {
    if (!dateRange?.from) return 'Все периоды'
    if (!dateRange.to) return format(dateRange.from, 'd MMM yyyy', { locale: ru })
    return `${format(dateRange.from, 'd MMM', { locale: ru })} – ${format(dateRange.to, 'd MMM yyyy', { locale: ru })}`
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError) {
    return <div className="text-destructive">Ошибка при загрузке данных аренды.</div>
  }

  return (
    <DataTable
      table={table}
      emptyMessage="Нет записей об аренде."
      showPagination
      toolbar={
        <div className="flex flex-col gap-2 md:flex-row md:items-end">
          <Input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Поиск..."
            className="md:max-w-60"
          />

          <TableFilter
            label="Локация"
            items={locations}
            value={selectedLocations}
            onChange={setSelectedLocations}
          />

          <div className="flex items-end gap-1">
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger
                render={
                  <Button variant="outline" className="min-w-44 justify-start gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span className="truncate">{formatDateRange()}</span>
                    <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                }
              />
              <PopoverContent className="w-auto p-0" align="start">
                <div className="flex">
                  <div className="border-r p-2">
                    <div className="text-muted-foreground mb-2 px-2 text-xs font-medium">
                      Быстрый выбор
                    </div>
                    <div className="flex flex-col gap-1">
                      {datePresets.map((preset) => (
                        <Button
                          key={preset.label}
                          variant="ghost"
                          className="justify-start text-xs"
                          onClick={() => handlePresetSelect(preset)}
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Calendar
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    locale={ru}
                    numberOfMonths={2}
                  />
                </div>
              </PopoverContent>
            </Popover>

            {dateRange && (
              <Button variant="ghost" size="icon" onClick={() => setDateRange(undefined)}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      }
    />
  )
}
