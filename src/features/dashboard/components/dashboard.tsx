'use client'

import DataTable from '@/src/components/data-table'
import { Hint } from '@/src/components/hint'
import { StatCard } from '@/src/components/stat-card'
import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/src/components/ui/empty'
import { Skeleton } from '@/src/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/components/ui/tooltip'
import { moscowNow } from '@/src/lib/timezone'
import { cn } from '@/src/lib/utils'
import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { format, isSameDay } from 'date-fns'
import { ru } from 'date-fns/locale'
import {
  BookOpen,
  Calendar,
  Check,
  CircleAlert,
  CircleHelp,
  Clock,
  Info,
  RefreshCw,
  SquareArrowOutUpRight,
  X,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { createParser, useQueryStates } from 'nuqs'
import { useEffect } from 'react'
import { useDashboardMonthQuery } from '../queries'
import { DASHBOARD_MONTH_KEY_REGEX } from '../schemas'
import type {
  DashboardCalendarDaySummaryMap,
  DashboardDayData,
  DashboardDayStatus,
  DashboardLessonItem,
  DashboardMonthData,
} from '../types'
import { LessonCalendar } from './lesson-calendar'

const QUERY_STATE_OPTIONS = { shallow: true, history: 'push' as const }

function getMoscowToday() {
  const today = moscowNow()
  return new Date(today.getFullYear(), today.getMonth(), today.getDate())
}

function parseLocalDate(value: string) {
  const parts = value.split('-').map(Number)
  const [year = 0, month = 0, day = 0] = parts
  const date = new Date(year, month - 1, day)
  return Number.isNaN(date.getTime()) ? null : date
}

function serializeLocalDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function parseMonthKeyToDate(monthKey: string) {
  const [year = 0, month = 1] = monthKey.split('-').map(Number)
  return new Date(year, month - 1, 1)
}

function clampDateToMonth(date: Date, month: Date) {
  const lastDayOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  return new Date(month.getFullYear(), month.getMonth(), Math.min(date.getDate(), lastDayOfMonth))
}

function toMonthLabel(date: Date) {
  const label = format(date, 'LLLL yyyy', { locale: ru })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function toWeekdayLabel(date: Date) {
  const label = format(date, 'EEEE', { locale: ru })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function getMarkedRatio(marked: number, total: number) {
  if (total === 0) {
    return '0'
  }

  return `${marked} / ${total}`
}

const today = getMoscowToday()
const DEFAULT_MONTH_KEY = getMonthKey(today)

const localDateParser = createParser({
  parse: parseLocalDate,
  serialize: serializeLocalDate,
})

const monthKeyParser = createParser({
  parse: (value: string) => (DASHBOARD_MONTH_KEY_REGEX.test(value) ? value : null),
  serialize: (value: string) => value,
})

const dayStatusConfig: Record<
  Exclude<DashboardDayStatus, null>,
  { label: string; className: string; hint: string }
> = {
  marked: {
    label: 'Все отмечены',
    className: 'bg-success/10 text-success hover:bg-success/15 cursor-help',
    hint: 'Во всех активных уроках на этот день посещаемость уже проставлена.',
  },
  unmarked: {
    label: 'Есть неотмеченные',
    className: 'bg-destructive/10 text-destructive hover:bg-destructive/15 cursor-help',
    hint: 'Хотя бы в одном активном уроке остались ученики со статусом "Не отмечен".',
  },
}

const LESSON_COLUMNS: ColumnDef<DashboardLessonItem>[] = [
  {
    header: 'Урок',
    cell: (info) => (
      <Button
        variant={'outline'}
        size={'xs'}
        render={<Link href={`/lessons/${info.row.original.id}`} />}
        nativeButton={false}
      >
        Детали
        <SquareArrowOutUpRight />
      </Button>
    ),
  },
  {
    header: 'Ученики',
    accessorFn: (lesson) => lesson.attendance.length,
    cell: (info) => info.getValue(),
  },
  {
    id: 'course',
    header: 'Курс',
    accessorKey: 'group.course.id',
    cell: ({ row }) => row.original.group.course.name,
    filterFn: (row, columnId, filterValue) => {
      return filterValue.length === 0 || filterValue.includes(row.original.group.course.id)
    },
  },
  {
    header: 'Время',
    accessorKey: 'time',
    cell: (info) => info.getValue(),
  },
  {
    id: 'teacher',
    header: 'Учителя',
    cell: ({ row }) => (
      <div className="flex gap-x-1">
        {row.original.teachers.length === 0 ? (
          <span>-</span>
        ) : (
          row.original.teachers.map((t, index) => (
            <span key={t.name}>
              <Link href={`/organization/members/${t.id}`} className="text-primary hover:underline">
                {t.name}
              </Link>
              {index < row.original.teachers.length - 1 && ', '}
            </span>
          ))
        )}
      </div>
    ),
    filterFn: (row, columnId, filterValue) => {
      const teacherIds = row.original.teachers.map((t) => t.id)
      return (
        filterValue.length === 0 || teacherIds.some((teacherId) => filterValue.includes(teacherId))
      )
    },
  },
  {
    id: 'location',
    header: 'Локация',
    accessorFn: (lesson) => lesson.group.location?.id,
    cell: (info) => info.row.original.group.location?.name,
    filterFn: (row, columnId, filterValue) => {
      return filterValue.length === 0 || filterValue.includes(row.original.group.location?.id)
    },
  },

  {
    id: 'marks',
    header: () => (
      <span className="flex items-center gap-0.5">
        Отметки
        <Hint text="Показывает, все ли ученики отмечены на уроке. Зелёная галочка - все отмечены, красный крестик - есть неотмеченные." />
      </span>
    ),
    accessorFn: (lesson) => {
      if (lesson.status === 'CANCELLED') return 'cancelled'
      return lesson.attendance.some((a) => a.status === 'UNSPECIFIED') ? 'unmarked' : 'marked'
    },
    cell: (info) => {
      const value = info.getValue()
      if (value === 'cancelled') {
        return <span className="text-muted-foreground">-</span>
      }
      return value === 'marked' ? (
        <div className="text-success flex items-center gap-2">
          <Check className="size-4" />
        </div>
      ) : (
        <div className="text-destructive flex items-center gap-2">
          <X className="size-4" />
        </div>
      )
    },
  },
  {
    header: 'Статус',
    accessorKey: 'status',
    cell: (info) => (
      <span className={info.getValue() === 'ACTIVE' ? 'text-success' : 'text-muted-foreground'}>
        {info.getValue() === 'ACTIVE' ? 'Активен' : 'Отменён'}
      </span>
    ),
  },
]

export default function Dashboard() {
  const [pageState, setPageState] = useQueryStates(
    {
      month: monthKeyParser.withDefault(DEFAULT_MONTH_KEY),
      date: localDateParser.withDefault(today),
    },
    QUERY_STATE_OPTIONS,
  )

  const visibleMonth = parseMonthKeyToDate(pageState.month)

  useEffect(() => {
    const nextSelectedDay = clampDateToMonth(pageState.date, visibleMonth)

    if (serializeLocalDate(nextSelectedDay) !== serializeLocalDate(pageState.date)) {
      void setPageState({ date: nextSelectedDay })
    }
  }, [pageState.date, setPageState, visibleMonth])

  const { data, isPending, isError, error, isFetching, refetch } = useDashboardMonthQuery(
    pageState.month,
  )

  const selectedDayKey = serializeLocalDate(pageState.date)
  const selectedDayData = data?.days.find((day) => day.date === selectedDayKey) ?? null
  const daySummaries = buildCalendarDaySummaryMap(data)
  const isToday = data ? selectedDayKey === data.today : isSameDay(pageState.date, today)

  const table = useReactTable({
    data: selectedDayData ? selectedDayData.lessons : [],
    columns: LESSON_COLUMNS,
    getCoreRowModel: getCoreRowModel(),
  })

  const handleSelectDay = (day: Date) => {
    void setPageState({ date: day })
  }

  const handleMonthChange = (month: Date) => {
    void setPageState({
      month: getMonthKey(month),
      date: clampDateToMonth(pageState.date, month),
    })
  }

  const handleSelectToday = () => {
    const nextToday = getMoscowToday()

    void setPageState({
      month: getMonthKey(nextToday),
      date: nextToday,
    })
  }

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 xl:grid-cols-[22rem_minmax(0,1fr)]">
      <div className="space-y-2">
        <Card className={cn(isFetching && data && 'opacity-80')}>
          <CardHeader>
            <div>
              <CardTitle>
                <div className="flex gap-1">
                  <span>Календарь месяца</span>
                  <Tooltip>
                    <TooltipTrigger
                      delay={300}
                      render={
                        <Button type="button" size="icon-sm" variant="ghost">
                          <CircleHelp aria-hidden />
                        </Button>
                      }
                    />
                    <TooltipContent>
                      <div className="grid sm:grid-cols-3 xl:grid-cols-1">
                        <LegendItem
                          colorClassName="bg-success"
                          text="Все активные посещения отмечены"
                        />
                        <LegendItem
                          colorClassName="bg-destructive"
                          text="Есть неотмеченные ученики"
                        />
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardTitle>
            </div>
            <CardAction>
              <Button
                variant="outline"
                onClick={handleSelectToday}
                disabled={pageState.month === DEFAULT_MONTH_KEY && isSameDay(pageState.date, today)}
              >
                <Calendar />
                Сегодня
              </Button>
            </CardAction>
          </CardHeader>

          <CardContent className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-foreground text-sm font-medium">{toMonthLabel(visibleMonth)}</p>
              </div>
              {isFetching && (
                <Badge variant="outline" className="animate-pulse">
                  Обновляем
                </Badge>
              )}
            </div>

            <LessonCalendar
              selectedDay={pageState.date}
              visibleMonth={visibleMonth}
              daySummaries={daySummaries}
              onSelectDay={handleSelectDay}
              onMonthChange={handleMonthChange}
            />
          </CardContent>
        </Card>

        {isPending && !data ? (
          <MonthOverviewSkeleton />
        ) : (
          <MonthOverviewCard data={data} isFetching={isFetching} />
        )}
      </div>

      <div className="min-h-0 space-y-2">
        {isPending && !data ? (
          <DashboardContentSkeleton />
        ) : isError ? (
          <DashboardErrorState error={error} onRetry={() => void refetch()} />
        ) : data && data.summary.totalLessons === 0 ? (
          <DashboardEmptyMonth month={visibleMonth} />
        ) : (
          <>
            <SelectedDayHeader
              selectedDay={pageState.date}
              dayData={selectedDayData}
              isToday={isToday}
            />

            {selectedDayData ? (
              <Card>
                <CardContent>
                  {/* {selectedDayData.lessons.map((lesson) => (
                  <LessonCard key={lesson.id} lesson={lesson} />
                  ))} */}
                  <DataTable table={table} />
                </CardContent>
              </Card>
            ) : (
              <DashboardEmptyDay selectedDay={pageState.date} />
            )}
          </>
        )}
      </div>
    </div>
  )
}

function buildCalendarDaySummaryMap(
  data: DashboardMonthData | undefined,
): DashboardCalendarDaySummaryMap {
  if (!data) {
    return {}
  }

  return Object.fromEntries(
    data.days.map((day) => [
      day.date,
      {
        status: day.status,
        totalLessons: day.summary.totalLessons,
        unmarkedAttendanceCount: day.summary.unmarkedAttendanceCount,
      },
    ]),
  )
}

function LegendItem({ colorClassName, text }: { colorClassName: string; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg">
      <span className={cn('size-2 rounded-full', colorClassName)} />
      <span className="text-xs/relaxed">{text}</span>
    </div>
  )
}

function MonthOverviewCard({
  data,
  isFetching,
}: {
  data: DashboardMonthData | undefined
  isFetching: boolean
}) {
  const summary = data?.summary

  return (
    <Card className={cn(isFetching && summary && 'opacity-80')}>
      <CardHeader>
        <div>
          <CardTitle>Обзор месяца</CardTitle>
          <CardDescription>Ключевые сигналы по выбранному месяцу и текущему дню.</CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          <StatCard
            label="Всего уроков"
            value={summary?.totalLessons ?? '—'}
            icon={BookOpen}
            hint="Во всех днях выбранного месяца"
          />
          <StatCard
            label="Дни с риском"
            value={summary?.unmarkedDays ?? '—'}
            icon={CircleAlert}
            variant={summary && summary.unmarkedDays > 0 ? 'danger' : 'default'}
            hint="Дни, где есть хотя бы один неотмеченный ученик"
          />
          <StatCard label="Сегодня" value={summary?.todayLessons ?? '—'} icon={Calendar} />
          <StatCard
            label="Отмены"
            value={summary?.cancelledLessons ?? '—'}
            icon={XCircle}
            variant={summary && summary.cancelledLessons > 0 ? 'warning' : 'default'}
            hint="Отменённые уроки всё ещё видны в календаре"
          />
        </div>
      </CardContent>
    </Card>
  )
}

function SelectedDayHeader({
  selectedDay,
  dayData,
  isToday,
}: {
  selectedDay: Date
  dayData: DashboardDayData | null
  isToday: boolean
}) {
  const statusMeta = dayData?.status ? dayStatusConfig[dayData.status] : null
  const summary = dayData?.summary ?? {
    totalLessons: 0,
    activeLessons: 0,
    cancelledLessons: 0,
    attendanceCount: 0,
    attendanceToMarkCount: 0,
    markedAttendanceCount: 0,
    unmarkedAttendanceCount: 0,
    presentCount: 0,
    absentCount: 0,
  }

  return (
    <Card>
      <CardHeader>
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{toWeekdayLabel(selectedDay)}</Badge>
            {statusMeta ? (
              <>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Badge className={statusMeta.className}>
                        {statusMeta.label}
                        <Info />
                      </Badge>
                    }
                  />
                  <TooltipContent>{statusMeta.hint}</TooltipContent>
                </Tooltip>
              </>
            ) : (
              <Badge variant="outline">Без статуса</Badge>
            )}
            {isToday && <Badge variant="secondary">Сегодня</Badge>}
          </div>

          <div>
            <CardTitle className="text-xl tracking-tight sm:text-2xl">
              {format(selectedDay, 'd MMMM', { locale: ru })}
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid gap-2 sm:grid-cols-4">
          <SummaryTile label="Уроки" value={summary.totalLessons} />
          <SummaryTile
            label="Отмечено"
            value={getMarkedRatio(summary.markedAttendanceCount, summary.attendanceToMarkCount)}
          />
          <SummaryTile label="Не отмечены" value={summary.unmarkedAttendanceCount} />
          <SummaryTile label="Отмены" value={summary.cancelledLessons} />
        </div>
      </CardContent>
    </Card>
  )
}

function SummaryTile({
  label,
  value,
  description,
}: {
  label: string
  value: React.ReactNode
  description?: string
}) {
  return (
    <div className="bg-muted/40 rounded-lg px-3 py-2">
      <div className="text-muted-foreground text-[0.6875rem] tracking-[0.12em] uppercase">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold tracking-tight">{value}</div>
      {description && (
        <div className="text-muted-foreground mt-1 text-[0.6875rem] leading-tight">
          {description}
        </div>
      )}
    </div>
  )
}

function DashboardEmptyMonth({ month }: { month: Date }) {
  return (
    <Card>
      <CardContent>
        <Empty className="bg-muted/20 border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Calendar />
            </EmptyMedia>
            <EmptyTitle>На {toMonthLabel(month)} уроков нет</EmptyTitle>
            <EmptyDescription>
              Месячный снапшот загрузился успешно, но в выбранном месяце нет ни одного урока.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </CardContent>
    </Card>
  )
}

function DashboardEmptyDay({ selectedDay }: { selectedDay: Date }) {
  return (
    <Card>
      <CardContent>
        <Empty className="bg-muted/20 border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Clock />
            </EmptyMedia>
            <EmptyTitle>На {format(selectedDay, 'd MMMM', { locale: ru })} уроков нет</EmptyTitle>
            <EmptyDescription>
              Месяц уже загружен. Выберите другой день в календаре, чтобы увидеть расписание и
              посещаемость.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </CardContent>
    </Card>
  )
}

function DashboardErrorState({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const message = error instanceof Error ? error.message : 'Не удалось загрузить dashboard'

  return (
    <Card className="min-h-72">
      <CardContent className="flex h-full items-center">
        <Empty className="border-destructive/20 bg-destructive/5 border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CircleAlert />
            </EmptyMedia>
            <EmptyTitle>Ошибка загрузки</EmptyTitle>
            <EmptyDescription>{message}</EmptyDescription>
          </EmptyHeader>
          <Button variant="outline" onClick={onRetry}>
            <RefreshCw />
            Попробовать снова
          </Button>
        </Empty>
      </CardContent>
    </Card>
  )
}

function MonthOverviewSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Обзор месяца</CardTitle>
          <CardDescription>Подгружаем основные показатели...</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-lg" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function DashboardContentSkeleton() {
  return (
    <div className="space-y-2">
      <Card>
        <CardContent className="space-y-2 py-4">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-10 w-56" />
          <div className="grid gap-2 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-18 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>

      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index}>
          <CardContent className="space-y-2 py-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
            <div className="grid gap-2 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((__, tileIndex) => (
                <Skeleton key={tileIndex} className="h-18 rounded-lg" />
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 6 }).map((__, badgeIndex) => (
                <Skeleton key={badgeIndex} className="h-7 w-28 rounded-xl" />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
