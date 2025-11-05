'use client'

import { getLessons } from '@/actions/lessons'
import { DateRangePicker } from '@/components/date-range-picker'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useData } from '@/providers/data-provider'
import { Prisma } from '@prisma/client'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useEffect, useState } from 'react'
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
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [locationId, setLocationId] = useState<string>('')

  const { locations } = useData()

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
        const l = await getLessons({
          where: {
            date: {
              gte: from,
              lte: to,
            },
            group: locationId
              ? {
                  locationId: Number(locationId),
                }
              : undefined,
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
        console.log(l)
        setLessons(l)
      } else {
        setLessons([])
      }
    }

    getLessonsFromPeriod()
  }, [dateRange, locationId])

  function resetFilters() {
    setDateRange(undefined)
    setLocationId('')
  }

  return (
    <Card>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-4">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            calendarProps={{
              numberOfMonths: 2,
              disabled: { after: today, before: new Date(2025, 8, 1) },
              locale: ru,
            }}
          />
          <Select onValueChange={setLocationId} value={locationId}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите локацию" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id.toString()}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        {/* <RevenueChart
          data={transformLessonsToRevenueData(lessons).map((item) => ({
            date: item.date,
            revenue: item.revenue,
          }))}
        /> */}
      </CardContent>
    </Card>
  )
}
