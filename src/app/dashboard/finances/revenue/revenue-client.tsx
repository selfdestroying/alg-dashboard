'use client'

import { getLessons } from '@/actions/lessons'
import TableFilter, { TableFilterItem } from '@/components/table-filter'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent } from '@/components/ui/card'
import { useData } from '@/providers/data-provider'
import { Prisma } from '@prisma/client'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useEffect, useMemo, useState } from 'react'
import { DateRange } from 'react-day-picker'
import { RevenueSummary } from './revenue-summary'
import { RevenueTable } from './revenue-table'

export function transformLessonsToRevenueData(
  lessons: Prisma.LessonGetPayload<{
    include: { attendance: { include: { student: true } }; group: true }
  }>[]
) {
  // Группируем уроки по дате
  const groupedByDate: Record<
    string,
    Prisma.LessonGetPayload<{
      include: { attendance: { include: { student: true } }; group: true }
    }>[]
  > = {}

  for (const lesson of lessons) {
    const date = format(new Date(lesson.date), 'dd.MM.yyyy', { locale: ru })
    if (!groupedByDate[date]) groupedByDate[date] = []
    groupedByDate[date].push(lesson)
  }

  return Object.entries(groupedByDate).map(([date, lessons]) => ({
    date,
    revenue: lessons.reduce(
      (prev, curr) =>
        prev +
        Math.floor(
          curr.attendance.reduce(
            (prev1, curr1) =>
              prev1 +
              (curr1.student.totalLessons !== 0 && curr1.studentStatus !== 'TRIAL'
                ? curr1.student.totalPayments / curr1.student.totalLessons
                : 0),
            0
          )
        ),
      0
    ),
    lessons: lessons.map((lesson) => ({
      time: lesson.time || '—',
      group: `${lesson.group.name}`,
      teacher: '—', // можно будет добавить, если есть связь с преподавателем
      revenue: Math.floor(
        lesson.attendance.reduce(
          (prev1, curr1) =>
            prev1 +
            (curr1.student.totalLessons !== 0 && curr1.studentStatus !== 'TRIAL'
              ? curr1.student.totalPayments / curr1.student.totalLessons
              : 0),
          0
        )
      ),
      students: lesson.attendance.map((att) => ({
        name: `${att.student.firstName} ${att.student.lastName ?? ''} ${att.studentStatus === 'TRIAL' ? '- пробный' : ''}`.trim(),
        revenue:
          att.studentStatus !== 'TRIAL' ? att.student.totalPayments / att.student.totalLessons : 0,
      })),
    })),
  }))
}

export default function RevenueClient() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const today = new Date()
    return {
      from: new Date(today.getFullYear(), today.getMonth(), 1),
      to: new Date(today.getFullYear(), today.getMonth() + 1, 0),
    }
  })
  const [selectedLocations, setSelectedLocations] = useState<TableFilterItem[]>([])
  const [selectedCourses, setSelectedCourses] = useState<TableFilterItem[]>([])

  const { locations, courses } = useData()

  const [lessons, setLessons] = useState<
    Prisma.LessonGetPayload<{
      include: { attendance: { include: { student: true } }; group: true }
    }>[]
  >([])
  const today = new Date()

  useEffect(() => {
    async function getLessonsFromPeriod() {
      if (dateRange && dateRange.from && dateRange.to) {
        const from = new Date(
          dateRange.from.getFullYear(),
          dateRange.from.getMonth(),
          dateRange.from.getDate()
        )
        const to = new Date(
          dateRange.to.getFullYear(),
          dateRange.to.getMonth(),
          dateRange.to.getDate()
        )
        const groupFilter: { courseId?: object; locationId?: object } = {}
        if (selectedCourses.length > 0) {
          groupFilter.courseId = { in: selectedCourses.map((course) => +course.value) }
        }
        if (selectedLocations.length > 0) {
          groupFilter.locationId = { in: selectedLocations.map((location) => +location.value) }
        }

        const l = await getLessons({
          where: {
            date: {
              gte: from,
              lte: to,
            },
            group: groupFilter,
          },
          include: {
            attendance: {
              where: {
                status: 'PRESENT',
              },
              include: {
                student: true,
              },
            },
            group: true,
          },
          orderBy: {
            date: 'asc',
          },
        })
        setLessons(l)
      } else {
        setLessons([])
      }
    }

    getLessonsFromPeriod()
  }, [dateRange, selectedCourses, selectedLocations])

  function resetFilters() {
    const start = new Date(today.getFullYear(), today.getMonth(), 1)
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    setDateRange({ from: start, to: end })
    setSelectedLocations([])
    setSelectedCourses([])
  }

  const mappedCourses = useMemo(
    () => courses.map((course) => ({ label: course.name, value: course.id.toString() })),
    [courses]
  )
  const mappedLocations = useMemo(
    () =>
      locations.map((location) => ({
        label: location.name,
        value: location.id.toString(),
      })),
    [locations]
  )
  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <Calendar
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={setDateRange}
            locale={ru}
          />
          <TableFilter items={mappedCourses} label="Курс" onChange={setSelectedCourses} />
          <TableFilter items={mappedLocations} label="Локация" onChange={setSelectedLocations} />
          <Button variant="outline" onClick={resetFilters}>
            Сбросить
          </Button>
        </div>
        <RevenueSummary
          totalRevenue={Math.floor(
            lessons.reduce(
              (prev, curr) =>
                prev +
                curr.attendance.reduce(
                  (prev1, curr1) =>
                    prev1 +
                    (curr1.student.totalLessons !== 0 && curr1.studentStatus !== 'TRIAL'
                      ? curr1.student.totalPayments / curr1.student.totalLessons
                      : 0),
                  0
                ),
              0
            )
          )}
          totalLessons={lessons.reduce(
            (prev, curr) =>
              prev +
              curr.attendance.reduce(
                (prev1, curr1) => prev1 + (curr1.studentStatus !== 'TRIAL' ? 1 : 0),
                0
              ),
            0
          )}
          paymentRate={0 / 0}
        />
        <RevenueTable data={transformLessonsToRevenueData(lessons)} />
      </CardContent>
    </Card>
  )
}
