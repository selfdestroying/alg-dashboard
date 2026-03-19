'use client'

import { Button } from '@/src/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/src/components/ui/empty'
import { Skeleton } from '@/src/components/ui/skeleton'
import { normalizeDateOnly } from '@/src/lib/timezone'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { CalendarSearch, FileSpreadsheet } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { exportRevenueToXlsx } from '../export-xlsx'
import { useRevenueDataQuery } from '../queries'
import type { RevenueFilters } from '../schemas'
import type { RevenueData } from '../types'
import RevenueFiltersBar, { type RevenueFilterState } from './revenue-filters'
import RevenueStatsCards from './revenue-stats'
import RevenueTimeline from './revenue-timeline'

const initialFilterState: RevenueFilterState = {
  dateRange: undefined,
  selectedCourses: [],
  selectedLocations: [],
  selectedTeachers: [],
}

export default function Revenue() {
  const [filterState, setFilterState] = useState<RevenueFilterState>(initialFilterState)

  const filters: RevenueFilters | null = useMemo(() => {
    const { dateRange, selectedCourses, selectedLocations, selectedTeachers } = filterState
    if (!dateRange?.from || !dateRange?.to) return null
    return {
      startDate: normalizeDateOnly(dateRange.from).toISOString(),
      endDate: normalizeDateOnly(dateRange.to).toISOString(),
      courseIds: selectedCourses.length > 0 ? selectedCourses.map((c) => +c.value) : undefined,
      locationIds:
        selectedLocations.length > 0 ? selectedLocations.map((l) => +l.value) : undefined,
      teacherIds: selectedTeachers.length > 0 ? selectedTeachers.map((t) => +t.value) : undefined,
    }
  }, [filterState])

  const { data, isPending } = useRevenueDataQuery(filters)
  const isLoading = isPending && !!filters

  const handleExport = useCallback(() => {
    if (!data || !filterState.dateRange?.from || !filterState.dateRange?.to) return
    const label = `${format(filterState.dateRange.from, 'd_MMM_yyyy', { locale: ru })}-${format(filterState.dateRange.to, 'd_MMM_yyyy', { locale: ru })}`
    exportRevenueToXlsx(data as RevenueData, label)
  }, [data, filterState.dateRange])

  return (
    <>
      <RevenueFiltersBar filterState={filterState} setFilterState={setFilterState} />

      {/* Empty state — no date range selected */}
      {!filters && (
        <Empty className="bg-card ring-foreground/10 h-full ring-1">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarSearch />
            </EmptyMedia>
            <EmptyTitle>Период не выбран</EmptyTitle>
            <EmptyDescription>
              Укажите диапазон дат, чтобы увидеть расписание и статистику
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {/* Loading state */}
      {isLoading && (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-lg" />
            ))}
          </div>
        </>
      )}

      {/* Data loaded */}
      {data && !isLoading && (
        <>
          <div className="flex items-center justify-end">
            <Button variant="outline" onClick={handleExport}>
              <FileSpreadsheet />
              Выгрузить в Excel
            </Button>
          </div>
          <RevenueStatsCards stats={data.stats} isLoading={false} />
          <RevenueTimeline days={data.days} />
        </>
      )}
    </>
  )
}
