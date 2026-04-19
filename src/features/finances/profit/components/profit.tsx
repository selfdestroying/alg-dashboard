'use client'

import { Button } from '@/src/components/ui/button'
import { Calendar } from '@/src/components/ui/calendar'
import { Card, CardContent } from '@/src/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/src/components/ui/empty'
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover'
import { Skeleton } from '@/src/components/ui/skeleton'
import { moscowNow, normalizeDateOnly } from '@/src/lib/timezone'
import {
  endOfMonth,
  endOfQuarter,
  endOfWeek,
  format,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  subMonths,
  subQuarters,
  subWeeks,
} from 'date-fns'
import { ru } from 'date-fns/locale'
import { Calendar as CalendarIcon, CalendarSearch, ChevronDown, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { useProfitDataQuery } from '../queries'
import type { ProfitFilters } from '../schemas'
import ProfitBreakdown from './profit-breakdown'
import ProfitSummary from './profit-summary'

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
  {
    label: 'Текущий квартал',
    getValue: () => ({
      from: startOfQuarter(moscowNow()),
      to: endOfQuarter(moscowNow()),
    }),
  },
  {
    label: 'Прошлый квартал',
    getValue: () => ({
      from: startOfQuarter(subQuarters(moscowNow(), 1)),
      to: endOfQuarter(subQuarters(moscowNow(), 1)),
    }),
  },
]

export default function Profit() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const filters: ProfitFilters | null = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return null
    return {
      startDate: normalizeDateOnly(dateRange.from).toISOString(),
      endDate: normalizeDateOnly(dateRange.to).toISOString(),
    }
  }, [dateRange])

  const { data, isPending, isError, error } = useProfitDataQuery(filters)
  const isLoading = isPending && !!filters

  const handlePresetSelect = (preset: (typeof datePresets)[0]) => {
    setDateRange(preset.getValue())
    setIsCalendarOpen(false)
  }

  const formatDateRange = () => {
    if (!dateRange?.from) return 'Выберите период'
    if (!dateRange.to) return format(dateRange.from, 'd MMM yyyy', { locale: ru })
    return `${format(dateRange.from, 'd MMM', { locale: ru })} – ${format(dateRange.to, 'd MMM yyyy', { locale: ru })}`
  }

  return (
    <>
      {/* Date range picker */}
      <Card>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Empty state */}
      {!filters && (
        <Empty className="bg-card ring-foreground/10 h-full ring-1">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarSearch />
            </EmptyMedia>
            <EmptyTitle>Период не выбран</EmptyTitle>
            <EmptyDescription>
              Укажите диапазон дат, чтобы рассчитать прибыль за период
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {/* Error state */}
      {isError && !isLoading && (
        <Empty className="bg-card ring-destructive/20 h-full ring-1">
          <EmptyHeader>
            <EmptyTitle>Ошибка загрузки</EmptyTitle>
            <EmptyDescription>
              {error instanceof Error ? error.message : 'Не удалось загрузить данные'}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-80 rounded-lg" />
        </div>
      )}

      {/* Data loaded */}
      {data && !isLoading && (
        <Card>
          <CardContent>
            <div className="space-y-4">
              <ProfitSummary data={data} />
              <ProfitBreakdown data={data} />
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
