'use client'

import TableFilter, { type TableFilterItem } from '@/src/components/table-filter'
import { Button } from '@/src/components/ui/button'
import { Calendar } from '@/src/components/ui/calendar'
import { Card, CardContent } from '@/src/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover'
import { useMappedCourseListQuery } from '@/src/features/courses/queries'
import { useMappedLocationListQuery } from '@/src/features/locations/queries'
import { useMappedMemberListQuery } from '@/src/features/organization/members/queries'
import { moscowNow } from '@/src/lib/timezone'
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
import { Dispatch, SetStateAction, useState } from 'react'
import type { DateRange } from 'react-day-picker'

const datePresets = [
  {
    label: 'Текущая неделя',
    getValue: () => ({
      from: startOfWeek(moscowNow(), { weekStartsOn: 1 }),
      to: endOfWeek(moscowNow(), { weekStartsOn: 1 }),
    }),
  },
  {
    label: 'Прошлая неделя',
    getValue: () => ({
      from: startOfWeek(subWeeks(moscowNow(), 1), { weekStartsOn: 1 }),
      to: endOfWeek(subWeeks(moscowNow(), 1), { weekStartsOn: 1 }),
    }),
  },
  {
    label: 'Текущий месяц',
    getValue: () => ({
      from: startOfMonth(moscowNow()),
      to: endOfMonth(moscowNow()),
    }),
  },
  {
    label: 'Прошлый месяц',
    getValue: () => ({
      from: startOfMonth(subMonths(moscowNow(), 1)),
      to: endOfMonth(subMonths(moscowNow(), 1)),
    }),
  },
]

export interface RevenueFilterState {
  dateRange: DateRange | undefined
  selectedCourses: TableFilterItem[]
  selectedLocations: TableFilterItem[]
  selectedTeachers: TableFilterItem[]
}

interface RevenueFiltersBarProps {
  filterState: RevenueFilterState
  setFilterState: Dispatch<SetStateAction<RevenueFilterState>>
}

export default function RevenueFiltersBar({ filterState, setFilterState }: RevenueFiltersBarProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const { data: courses = [] } = useMappedCourseListQuery()
  const { data: locations = [] } = useMappedLocationListQuery()
  const { data: teachers = [] } = useMappedMemberListQuery()

  const { dateRange, selectedCourses, selectedLocations, selectedTeachers } = filterState

  const handlePresetSelect = (preset: (typeof datePresets)[0]) => {
    setFilterState((prev) => ({ ...prev, dateRange: preset.getValue() }))
    setIsCalendarOpen(false)
  }

  const formatDateRange = () => {
    if (!dateRange?.from) return 'Выберите период'
    if (!dateRange.to) return format(dateRange.from, 'd MMM yyyy', { locale: ru })
    return `${format(dateRange.from, 'd MMM', { locale: ru })} – ${format(dateRange.to, 'd MMM yyyy', { locale: ru })}`
  }

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col items-end gap-2 lg:flex-row lg:justify-between">
          {/* Date range picker */}
          <div className="flex items-center gap-2">
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger
                render={
                  <Button variant="outline" className="min-w-50 justify-start gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span className="truncate">{formatDateRange()}</span>
                    <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                }
              />
              <PopoverContent className="w-auto p-0" align="start">
                <div className="flex">
                  {/* Presets */}
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
                  {/* Calendar */}
                  <Calendar
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={(range) => setFilterState((prev) => ({ ...prev, dateRange: range }))}
                    locale={ru}
                    numberOfMonths={2}
                  />
                </div>
              </PopoverContent>
            </Popover>

            {dateRange && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setFilterState((prev) => ({ ...prev, dateRange: undefined }))}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Entity filters */}
          <TableFilter
            label="Курс"
            items={courses}
            value={selectedCourses}
            onChange={(v) => setFilterState((prev) => ({ ...prev, selectedCourses: v }))}
          />
          <TableFilter
            label="Локация"
            items={locations}
            value={selectedLocations}
            onChange={(v) => setFilterState((prev) => ({ ...prev, selectedLocations: v }))}
          />
          <TableFilter
            label="Преподаватель"
            items={teachers}
            value={selectedTeachers}
            onChange={(v) => setFilterState((prev) => ({ ...prev, selectedTeachers: v }))}
          />
        </div>
      </CardContent>
    </Card>
  )
}
