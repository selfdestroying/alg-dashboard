'use client'
import { getLessons } from '@/src/actions/lessons'
import { getPaychecks } from '@/src/actions/paycheck'
import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { Calendar } from '@/src/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/src/components/ui/collapsible'
import { usePermission } from '@/src/hooks/usePermission'
import { getFullName, getGroupName } from '@/src/lib/utils'
import { useAuth } from '@/src/providers/auth-provider'
import { UserDTO } from '@/types/user'
import { GroupType, PayCheck, Prisma } from '@prisma/client'
import { cva } from 'class-variance-authority'
import {
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from 'date-fns'
import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz'
import { ru } from 'date-fns/locale'
import {
  Banknote,
  BookOpen,
  Calendar as CalendarIcon,
  ChevronDown,
  Clock,
  FileText,
  MapPin,
  Receipt,
  TrendingUp,
  User,
  Users,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { type DateRange } from 'react-day-picker'
import { lessonStatusMap } from '../../lessons/[id]/_components/info-section'

const groupTypeMap: Record<GroupType, string> = {
  GROUP: 'Группа',
  INDIVIDUAL: 'Индив.',
  INTENSIVE: 'Интенсив',
}

const groupTypeIcon: Record<GroupType, React.ReactNode> = {
  GROUP: <Users className="h-3 w-3" />,
  INDIVIDUAL: <User className="h-3 w-3" />,
  INTENSIVE: <TrendingUp className="h-3 w-3" />,
}

type LessonWithPrice = Prisma.LessonGetPayload<{
  include: {
    teachers: {
      include: {
        teacher: {
          omit: {
            password: true
            createdAt: true
          }
        }
      }
    }
    group: {
      include: {
        course: true
        location: true
      }
    }
  }
}> & { price: number }

type TeacherSalaryData = {
  teacher: UserDTO
  lessons: LessonWithPrice[]
}

// Пресеты для быстрого выбора периода
const datePresets = [
  {
    label: 'Текущая неделя',
    getValue: () => ({
      from: startOfWeek(toZonedTime(new Date(), 'Europe/Moscow'), { weekStartsOn: 1 }),
      to: endOfWeek(toZonedTime(new Date(), 'Europe/Moscow'), { weekStartsOn: 1 }),
    }),
  },
  {
    label: 'Прошлая неделя',
    getValue: () => ({
      from: startOfWeek(subWeeks(toZonedTime(new Date(), 'Europe/Moscow'), 1), { weekStartsOn: 1 }),
      to: endOfWeek(subWeeks(toZonedTime(new Date(), 'Europe/Moscow'), 1), { weekStartsOn: 1 }),
    }),
  },
  {
    label: 'Текущий месяц',
    getValue: () => ({
      from: startOfMonth(toZonedTime(new Date(), 'Europe/Moscow')),
      to: endOfMonth(toZonedTime(new Date(), 'Europe/Moscow')),
    }),
  },
  {
    label: 'Прошлый месяц',
    getValue: () => ({
      from: startOfMonth(subMonths(toZonedTime(new Date(), 'Europe/Moscow'), 1)),
      to: endOfMonth(subMonths(toZonedTime(new Date(), 'Europe/Moscow'), 1)),
    }),
  },
]

export default function Salaries() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [selectedLocations, setSelectedLocations] = useState<TableFilterItem[]>([])
  const [selectedCourses, setSelectedCourses] = useState<TableFilterItem[]>([])
  const [selectedTeachers, setSelectedTeachers] = useState<TableFilterItem[]>([])
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const canViewSalary = usePermission('VIEW_OTHER_SALARY')
  const user = useAuth()
  const { locations, courses, users } = useData()

  const [lessons, setLessons] = useState<TeacherSalaryData[]>([])
  const [paychecks, setPaychecks] = useState<PayCheck[]>([])

  const fetchData = useCallback(async () => {
    if (dateRange?.from && dateRange?.to) {
      const { startDate, endDate } = {
        startDate: fromZonedTime(dateRange.from, 'Europe/Moscow'),
        endDate: fromZonedTime(dateRange.to, 'Europe/Moscow'),
      }

      // Фильтры по группе
      const groupFilter: { courseId?: object; locationId?: object } = {}
      if (selectedCourses.length > 0) {
        groupFilter.courseId = { in: selectedCourses.map((c) => +c.value) }
      }
      if (selectedLocations.length > 0) {
        groupFilter.locationId = { in: selectedLocations.map((l) => +l.value) }
      }

      // Фильтр по преподавателям
      const teacherFilter = canViewSalary
        ? selectedTeachers.length > 0
          ? { some: { teacherId: { in: selectedTeachers.map((t) => +t.value) } } }
          : undefined
        : { some: { teacherId: user.id } }

      const [lessonsData, paychecksData] = await Promise.all([
        getLessons({
          where: {
            date: { gte: startDate, lte: endDate },
            teachers: teacherFilter,
            group: Object.keys(groupFilter).length > 0 ? groupFilter : undefined,
          },
          include: {
            teachers: {
              where: !canViewSalary
                ? { teacherId: user.id }
                : selectedTeachers.length > 0
                  ? { teacherId: { in: selectedTeachers.map((t) => +t.value) } }
                  : undefined,
              include: { teacher: { include: { role: true } } },
            },
            group: {
              include: {
                course: true,
                location: true,
              },
            },
          },
          orderBy: [{ date: 'asc' }, { time: 'asc' }],
        }),
        getPaychecks({
          where: { date: { gte: startDate, lte: endDate } },
        }),
      ])

      // Сортировка по дате и времени
      lessonsData.sort((a, b) => {
        const dateA = toZonedTime(a.date, 'Europe/Moscow')
        const dateB = toZonedTime(b.date, 'Europe/Moscow')
        if (dateA.getTime() !== dateB.getTime()) return dateA.getTime() - dateB.getTime()
        if (a.time && b.time) {
          const [aH, aM] = a.time.split(':').map(Number)
          const [bH, bM] = b.time.split(':').map(Number)
          return aH * 60 + aM - (bH * 60 + bM)
        }
        return 0
      })

      // Группировка по преподавателям
      const lessonsByTeacher: Record<number, TeacherSalaryData> = {}
      for (const lesson of lessonsData) {
        for (const tl of lesson.teachers) {
          const teacher = tl.teacher
          if (!lessonsByTeacher[teacher.id]) {
            lessonsByTeacher[teacher.id] = { teacher, lessons: [] }
          }
          lessonsByTeacher[teacher.id].lessons.push({ ...lesson, price: tl.bid })
        }
      }

      setLessons(Object.values(lessonsByTeacher))
      setPaychecks(paychecksData)
    } else {
      setLessons([])
      setPaychecks([])
    }
  }, [dateRange, canViewSalary, user.id, selectedCourses, selectedLocations, selectedTeachers])

  useEffect(() => {
    startTransition(() => {
      fetchData()
    })
  }, [fetchData])

  // Маппинг данных для фильтров
  const mappedCourses = useMemo(
    () => courses.map((course) => ({ label: course.name, value: course.id.toString() })),
    [courses]
  )
  const mappedLocations = useMemo(
    () => locations.map((location) => ({ label: location.name, value: location.id.toString() })),
    [locations]
  )
  const mappedTeachers = useMemo(
    () =>
      users.map((user) => ({
        label: getFullName(user.firstName, user.lastName),
        value: user.id.toString(),
      })),
    [users]
  )

  // Сводная статистика
  const stats = useMemo(() => {
    let totalSalary = 0
    let totalLessons = 0
    let cancelledLessons = 0
    let totalPaychecks = 0

    for (const r of lessons) {
      for (const lesson of r.lessons) {
        if (lesson.status !== 'CANCELLED') {
          totalSalary += lesson.price
          totalLessons++
        } else {
          cancelledLessons++
        }
      }
      const teacherPaychecks = paychecks.filter((p) => p.userId === r.teacher.id)
      totalPaychecks += teacherPaychecks.reduce((sum, p) => sum + p.amount, 0)
    }

    return {
      totalSalary: totalSalary + totalPaychecks,
      totalLessons,
      cancelledLessons,
      totalPaychecks,
      teacherCount: lessons.length,
      avgPerLesson: totalLessons > 0 ? Math.round(totalSalary / totalLessons) : 0,
    }
  }, [lessons, paychecks])

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
    <div className="space-y-2">
      {/* Панель управления */}
      <Card>
        <CardContent>
          <div className="flex flex-col items-end gap-2 lg:flex-row lg:justify-between">
            {/* Выбор периода */}
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
                    {/* Пресеты */}
                    <div className="border-r p-2">
                      <div className="text-muted-foreground mb-2 px-2 text-xs font-medium">
                        Быстрый выбор
                      </div>
                      <div className="flex flex-col gap-1">
                        {datePresets.map((preset) => (
                          <Button
                            key={preset.label}
                            variant="ghost"
                            size="sm"
                            className="justify-start text-xs"
                            onClick={() => handlePresetSelect(preset)}
                          >
                            {preset.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                    {/* Календарь */}
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

            {/* Фильтры */}
            {canViewSalary && (
              <TableFilter
                items={mappedTeachers}
                label="Преподаватель"
                onChange={setSelectedTeachers}
              />
            )}
            <TableFilter items={mappedCourses} label="Курс" onChange={setSelectedCourses} />
            <TableFilter items={mappedLocations} label="Локация" onChange={setSelectedLocations} />
          </div>
        </CardContent>
      </Card>

      {/* Статистика */}
      {dateRange?.from && dateRange?.to && (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Общая сумма"
            value={`${stats.totalSalary.toLocaleString()} ₽`}
            icon={<Banknote className="h-4 w-4" />}
            description={`${stats.teacherCount} сотрудник(ов)`}
            loading={isPending}
          />
          <StatCard
            title="Проведено уроков"
            value={stats.totalLessons.toString()}
            icon={<BookOpen className="h-4 w-4" />}
            description={
              stats.cancelledLessons > 0 ? `${stats.cancelledLessons} отменено` : 'Без отмен'
            }
            loading={isPending}
          />
          <StatCard
            title="Средняя ставка"
            value={`${stats.avgPerLesson.toLocaleString()} ₽`}
            icon={<TrendingUp className="h-4 w-4" />}
            description="за урок"
            loading={isPending}
          />
          <StatCard
            title="Доп. выплаты"
            value={`${stats.totalPaychecks.toLocaleString()} ₽`}
            icon={<Receipt className="h-4 w-4" />}
            description="по чекам"
            loading={isPending}
          />
        </div>
      )}

      {/* Контент */}
      {!dateRange?.from || !dateRange?.to ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CalendarIcon className="text-muted-foreground mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-medium">Выберите период</h3>
            <p className="text-muted-foreground text-center text-sm">
              Используйте календарь или быстрые пресеты для выбора периода отображения зарплат
            </p>
          </CardContent>
        </Card>
      ) : isPending ? (
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : lessons.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="text-muted-foreground mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-medium">Нет данных</h3>
            <p className="text-muted-foreground text-center text-sm">
              За выбранный период уроки не найдены. Попробуйте изменить фильтры.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {lessons.map((r) => (
            <TeacherCard
              key={r.teacher.id}
              data={r}
              paychecks={paychecks.filter((p) => p.userId === r.teacher.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Компонент карточки статистики
interface StatCardProps {
  title: string
  value: string
  icon: React.ReactNode
  description: string
  loading?: boolean
}

function StatCard({ title, value, icon, description, loading }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-muted-foreground text-sm font-medium">{title}</CardTitle>
        <span className="text-muted-foreground">{icon}</span>
      </CardHeader>
      <CardContent>
        {loading ? (
          <>
            <Skeleton className="mb-1 h-7 w-24" />
            <Skeleton className="h-4 w-16" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-muted-foreground text-xs">{description}</p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// Компонент карточки преподавателя
interface TeacherCardProps {
  data: TeacherSalaryData
  paychecks: PayCheck[]
}

function TeacherCard({ data, paychecks }: TeacherCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  const totalFromLessons = data.lessons.reduce(
    (sum, l) => (l.status !== 'CANCELLED' ? sum + l.price : sum),
    0
  )
  const totalFromPaychecks = paychecks.reduce((sum, p) => sum + p.amount, 0)
  const total = totalFromLessons + totalFromPaychecks

  const activeLessons = data.lessons.filter((l) => l.status !== 'CANCELLED')
  const cancelledLessons = data.lessons.filter((l) => l.status === 'CANCELLED')

  // Группировка уроков по датам
  const lessonsByDate = useMemo(() => {
    const grouped: Record<string, LessonWithPrice[]> = {}
    for (const lesson of data.lessons) {
      const dateKey = formatInTimeZone(lesson.date, 'Europe/Moscow', 'yyyy-MM-dd')
      if (!grouped[dateKey]) grouped[dateKey] = []
      grouped[dateKey].push(lesson)
    }
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))
  }, [data.lessons])

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="transition-shadow hover:shadow-md">
        <CollapsibleTrigger className="w-full text-left">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">
                    {getFullName(data.teacher.firstName, data.teacher.lastName)}
                  </CardTitle>
                  {data.teacher.role && (
                    <p className="text-muted-foreground text-xs">{data.teacher.role.name}</p>
                  )}
                </div>
              </div>
              <ChevronDown
                className={cn(
                  'text-muted-foreground h-5 w-5 transition-transform',
                  isOpen && 'rotate-180'
                )}
              />
            </div>
          </CardHeader>

          <CardContent>
            {/* Общая сумма */}
            <div className="mb-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold">{total.toLocaleString()} ₽</span>
              <div className="text-muted-foreground flex items-center gap-1 text-xs">
                <BookOpen className="h-3 w-3" />
                {activeLessons.length} урок(ов)
              </div>
            </div>

            {/* Мини-статистика */}
            <div className="flex flex-wrap gap-2">
              {totalFromLessons > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <BookOpen className="h-3 w-3" />
                  {totalFromLessons.toLocaleString()} ₽
                </Badge>
              )}
              {totalFromPaychecks > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <Receipt className="h-3 w-3" />
                  {totalFromPaychecks.toLocaleString()} ₽
                </Badge>
              )}
              {cancelledLessons.length > 0 && (
                <Badge variant="outline" className="text-destructive gap-1">
                  <X className="h-3 w-3" />
                  {cancelledLessons.length} отмена
                </Badge>
              )}
            </div>
          </CardContent>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent>
            <Tabs defaultValue="lessons">
              <TabsList>
                <TabsTrigger value="lessons" className="flex-1 gap-1">
                  <BookOpen className="h-3 w-3" />
                  Уроки ({data.lessons.length})
                </TabsTrigger>
                {paychecks.length > 0 && (
                  <TabsTrigger value="paychecks" className="flex-1 gap-1">
                    <Receipt className="h-3 w-3" />
                    Чеки ({paychecks.length})
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="lessons" className="mt-0 space-y-2">
                {lessonsByDate.map(([dateKey, lessons]) => (
                  <div key={dateKey}>
                    <div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs font-medium">
                      <CalendarIcon className="h-3 w-3" />
                      {formatInTimeZone(new Date(dateKey), 'Europe/Moscow', 'd MMMM, EEEE', {
                        locale: ru,
                      })}
                    </div>
                    <div className="space-y-2">
                      {lessons.map((lesson) => (
                        <LessonItem key={lesson.id} lesson={lesson} />
                      ))}
                    </div>
                  </div>
                ))}
              </TabsContent>

              {paychecks.length > 0 && (
                <TabsContent value="paychecks" className="mt-0 space-y-2">
                  {paychecks.map((paycheck) => (
                    <PaycheckItem key={paycheck.id} paycheck={paycheck} />
                  ))}
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

// Компонент элемента урока
interface LessonItemProps {
  lesson: LessonWithPrice
}

const lessonStatusVariants = cva('', {
  variants: {
    status: {
      ACTIVE: ['bg-success/10', 'text-success'],
      CANCELLED: ['bg-destructive/10', 'text-destructive'],
    },
  },
})

function LessonItem({ lesson }: LessonItemProps) {
  const isCancelled = lesson.status === 'CANCELLED'

  return (
    <div
      className={cn(
        'rounded-lg border p-3 transition-colors',
        isCancelled && 'bg-muted/50 opacity-75'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={cn('truncate font-medium', isCancelled && 'line-through')}>
              {getGroupName(lesson.group)}
            </span>
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
            <Tooltip>
              <TooltipTrigger className="flex items-center gap-1">
                {groupTypeIcon[lesson.group.type!]}
                {groupTypeMap[lesson.group.type!]}
              </TooltipTrigger>
              <TooltipContent>Тип занятия</TooltipContent>
            </Tooltip>
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

// Компонент элемента чека
interface PaycheckItemProps {
  paycheck: PayCheck
}

function PaycheckItem({ paycheck }: PaycheckItemProps) {
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
            {format(toZonedTime(paycheck.date, 'Europe/Moscow'), 'd MMMM yyyy', { locale: ru })}
          </div>
        </div>
        <span className="text-success text-sm font-semibold whitespace-nowrap">
          {paycheck.amount.toLocaleString()} ₽
        </span>
      </div>
    </div>
  )
}
