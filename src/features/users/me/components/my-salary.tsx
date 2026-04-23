'use client'

import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { Calendar } from '@/src/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/src/components/ui/empty'
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover'
import { Skeleton } from '@/src/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/components/ui/tooltip'
import { useMyManagerSalaryListQuery } from '@/src/features/finances/manager-salaries/queries'
import {
  useSalaryDataQuery,
  useSalaryPaychecksQuery,
} from '@/src/features/finances/salaries/queries'
import type { LessonWithPrice, SalaryFilters } from '@/src/features/finances/salaries/types'
import { useMyPaychecksQuery } from '@/src/features/users/me/queries'
import { dateOnlyToLocal, moscowNow, normalizeDateOnly } from '@/src/lib/timezone'
import { cn, getGroupName } from '@/src/lib/utils'
import { cva } from 'class-variance-authority'
import {
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from 'date-fns'
import { ru } from 'date-fns/locale'
import {
  BookOpen,
  Calendar as CalendarIcon,
  CalendarSearch,
  ChevronDown,
  Clock,
  FileText,
  MapPin,
  Receipt,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { type DateRange } from 'react-day-picker'

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

const lessonStatusMap = {
  ACTIVE: 'Активен',
  CANCELLED: 'Отменен',
} as const

const lessonStatusVariants = cva('', {
  variants: {
    status: {
      ACTIVE: ['bg-success/10', 'text-success'],
      CANCELLED: ['bg-destructive/10', 'text-destructive'],
    },
  },
})

export default function MySalary() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => ({
    from: startOfMonth(moscowNow()),
    to: endOfMonth(moscowNow()),
  }))
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const filters: SalaryFilters | null = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return null
    return {
      startDate: normalizeDateOnly(dateRange.from).toISOString(),
      endDate: normalizeDateOnly(dateRange.to).toISOString(),
    }
  }, [dateRange])

  const { data: salaryData, isPending, isError, error } = useSalaryDataQuery(filters)
  const { data: paychecks = [] } = useSalaryPaychecksQuery(
    filters?.startDate ?? null,
    filters?.endDate ?? null,
  )

  const myData = salaryData?.teachers[0]
  const lessons = useMemo(() => myData?.lessons ?? [], [myData])

  const lessonsByDate = useMemo(() => {
    const grouped: Record<string, LessonWithPrice[]> = {}
    for (const lesson of lessons) {
      const dateKey = new Date(lesson.date).toISOString().split('T')[0]!
      if (!grouped[dateKey]) grouped[dateKey] = []
      grouped[dateKey]!.push(lesson)
    }
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))
  }, [lessons])

  const handlePresetSelect = (preset: (typeof datePresets)[0]) => {
    setDateRange(preset.getValue())
    setIsCalendarOpen(false)
  }

  const formatDateRange = () => {
    if (!dateRange?.from) return 'Выберите период'
    if (!dateRange.to) return format(dateRange.from, 'd MMM yyyy', { locale: ru })
    return `${format(dateRange.from, 'd MMM', { locale: ru })} - ${format(dateRange.to, 'd MMM yyyy', { locale: ru })}`
  }

  return (
    <div className="space-y-2">
      <Card>
        <CardContent>
          <div className="flex items-center gap-2">
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger
                render={
                  <Button variant="outline" className="min-w-50 justify-start gap-2">
                    <CalendarIcon />
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
                <X />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {!dateRange?.from || !dateRange?.to ? (
        <Empty className="bg-card ring-foreground/10 h-full ring-1">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarSearch />
            </EmptyMedia>
            <EmptyTitle>Период не выбран</EmptyTitle>
            <EmptyDescription>
              Укажите диапазон дат, чтобы увидеть свои уроки и зарплату
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Tabs defaultValue="lessons">
          <TabsList className="bg-card ring-foreground/10 w-full rounded-lg p-1 ring-1">
            <TabsTrigger value="lessons">
              <BookOpen />
              Учитель
            </TabsTrigger>
            {/* <TabsTrigger value="manager">
              <Wallet />
              Менеджер
            </TabsTrigger> */}
          </TabsList>

          <TabsContent value="lessons" className="space-y-2">
            {isError ? (
              <Empty className="bg-card ring-destructive/20 h-full ring-1">
                <EmptyHeader>
                  <EmptyTitle>Ошибка загрузки</EmptyTitle>
                  <EmptyDescription>
                    {error instanceof Error ? error.message : 'Не удалось загрузить данные'}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : isPending ? (
              <Card>
                <CardContent>
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
            ) : lessons.length === 0 && paychecks.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <FileText className="text-muted-foreground mb-4 h-12 w-12" />
                  <h3 className="mb-2 text-lg font-medium">Нет данных</h3>
                  <p className="text-muted-foreground text-center text-sm">
                    За выбранный период уроки и выплаты не найдены.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-2 lg:grid-cols-2">
                {lessons.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <BookOpen />
                        Уроки ({lessons.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {lessonsByDate.map(([dateKey, dateLessons]) => (
                        <div key={dateKey}>
                          <div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs font-medium">
                            <CalendarIcon className="h-3 w-3" />
                            {format(dateOnlyToLocal(dateKey), 'd MMMM, EEEE', { locale: ru })}
                          </div>
                          <div className="space-y-2">
                            {dateLessons.map((lesson) => (
                              <LessonItem key={lesson.id} lesson={lesson} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
                {paychecks.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Receipt />
                        Чеки ({paychecks.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {paychecks.map((paycheck) => (
                        <PaycheckItem key={paycheck.id} paycheck={paycheck} />
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="manager" className="space-y-2">
            <ManagerSalaryTab
              startDate={filters?.startDate ?? null}
              endDate={filters?.endDate ?? null}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

function PaycheckItem({
  paycheck,
}: {
  paycheck: { id: number; date: Date | string; amount: number; comment: string | null }
}) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Receipt className="text-muted-foreground h-4 w-4 shrink-0" />
            <span className="truncate font-medium">{paycheck.comment || 'Выплата по чеку'}</span>
          </div>
          <div className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
            <CalendarIcon className="h-3 w-3" />
            {format(dateOnlyToLocal(paycheck.date), 'd MMMM yyyy', { locale: ru })}
          </div>
        </div>
        <span className="text-success text-sm font-semibold whitespace-nowrap">
          {paycheck.amount.toLocaleString()} ₽
        </span>
      </div>
    </div>
  )
}

interface ManagerSalaryTabProps {
  startDate: string | null
  endDate: string | null
}

function ManagerSalaryTab({ startDate, endDate }: ManagerSalaryTabProps) {
  const { data: salaries = [], isPending: isSalariesPending } = useMyManagerSalaryListQuery()
  const { data: myPaychecks = [], isPending: isPaychecksPending } = useMyPaychecksQuery()

  const isPending = isSalariesPending || isPaychecksPending

  const { periodPaychecks } = useMemo(() => {
    if (!startDate || !endDate) {
      return {
        fixedTotal: 0,
        bonusTotal: 0,
        advanceTotal: 0,
        salaryPayoutsTotal: 0,
        periodPaychecks: [] as typeof myPaychecks,
      }
    }

    const rangeStart = new Date(startDate)
    const rangeEnd = new Date(endDate)

    let fixed = 0
    let cursor = startOfMonth(rangeStart)
    const lastMonth = startOfMonth(rangeEnd)
    while (cursor.getTime() <= lastMonth.getTime()) {
      const monthStart = cursor
      const monthEnd = endOfMonth(cursor)
      const applicable = salaries.find(
        (s) =>
          new Date(s.startDate).getTime() <= monthEnd.getTime() &&
          (s.endDate === null || new Date(s.endDate).getTime() >= monthStart.getTime()),
      )
      if (applicable) fixed += applicable.monthlyAmount
      cursor = addMonths(cursor, 1)
    }

    const inRange = myPaychecks.filter((p) => {
      const d = new Date(p.date).getTime()
      return d >= rangeStart.getTime() && d <= rangeEnd.getTime()
    })

    const sumByType = (type: 'BONUS' | 'ADVANCE' | 'SALARY') =>
      inRange.filter((p) => p.type === type).reduce((sum, p) => sum + p.amount, 0)

    return {
      fixedTotal: fixed,
      bonusTotal: sumByType('BONUS'),
      advanceTotal: sumByType('ADVANCE'),
      salaryPayoutsTotal: sumByType('SALARY'),
      periodPaychecks: inRange,
    }
  }, [salaries, myPaychecks, startDate, endDate])

  const periodSalaries = useMemo(() => {
    return salaries.filter((s) => new Date(s.startDate).getTime() <= new Date(endDate!).getTime())
  }, [salaries, endDate])

  if (isPending) {
    return (
      <Card>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (salaries.length === 0 && periodPaychecks.length === 0) {
    return (
      <Empty className="bg-card ring-foreground/10 h-full ring-1">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Wallet />
          </EmptyMedia>
          <EmptyTitle>Фиксированная зарплата не назначена</EmptyTitle>
          <EmptyDescription>
            Обратитесь к владельцу организации, чтобы установить ставку.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <>
      <div className="grid gap-2 lg:grid-cols-2">
        {periodSalaries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Wallet />
                История ставок
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {periodSalaries.map((s) => (
                <div key={s.id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{s.monthlyAmount.toLocaleString()} ₽ / мес</div>
                      <div className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                        <CalendarIcon className="h-3 w-3" />
                        {format(dateOnlyToLocal(s.startDate), 'd MMM yyyy', { locale: ru })}
                        {' - '}
                        {s.endDate
                          ? format(dateOnlyToLocal(s.endDate), 'd MMM yyyy', { locale: ru })
                          : 'по настоящее время'}
                      </div>
                      {s.comment && (
                        <p className="text-muted-foreground mt-1 text-xs">{s.comment}</p>
                      )}
                    </div>
                    {s.endDate === null && (
                      <Badge variant="secondary" className="shrink-0">
                        Активна
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        {periodPaychecks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Receipt />
                Чеки за период ({periodPaychecks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {periodPaychecks.map((paycheck) => (
                <PaycheckItem key={paycheck.id} paycheck={paycheck} />
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}

function LessonItem({ lesson }: { lesson: LessonWithPrice }) {
  const isCancelled = lesson.status === 'CANCELLED'
  const hasBonus = lesson.bonusPerStudent > 0 && lesson.presentCount > 0

  return (
    <div
      className={cn(
        'rounded-lg border p-3 transition-colors',
        isCancelled && 'bg-muted/50 opacity-75',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/lessons/${lesson.id}`}
              className={cn(
                'text-primary truncate font-medium hover:underline',
                isCancelled && 'line-through',
              )}
            >
              {getGroupName(lesson.group)}
            </Link>
            <Badge className={cn('shrink-0', lessonStatusVariants({ status: lesson.status }))}>
              {lessonStatusMap[lesson.status]}
            </Badge>
          </div>
          <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            {lesson.time && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {lesson.time}
              </span>
            )}
            {lesson.group.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {lesson.group.location.name}
              </span>
            )}
            {hasBonus && (
              <Tooltip>
                <TooltipTrigger className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {lesson.presentCount} уч.
                </TooltipTrigger>
                <TooltipContent>
                  {lesson.price - lesson.bonusPerStudent * lesson.presentCount} ₽ ставка +{' '}
                  {lesson.bonusPerStudent} ₽ × {lesson.presentCount} уч. = {lesson.price} ₽
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
        <span
          className={cn('text-sm font-semibold whitespace-nowrap', isCancelled && 'line-through')}
        >
          {lesson.price.toLocaleString()} ₽
        </span>
      </div>
    </div>
  )
}
