'use client'

import { getLessons } from '@/actions/lessons'
import { DateRangePicker } from '@/components/date-range-picker'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Prisma } from '@prisma/client'
import { useEffect, useState } from 'react'
import { DateRange } from 'react-day-picker'

export default function FinanceClient() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [lessons, setLessons] = useState<
    Prisma.LessonGetPayload<{ include: { attendance: { include: { student: true } } } }>[]
  >([])

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
  }, [dateRange])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Фильтры</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <DateRangePicker value={dateRange} onChange={setDateRange} />
            <Button variant="outline" onClick={() => setDateRange(undefined)}>
              Сбросить
            </Button>
          </div>
          <div className="space-y-2">
            <p>Доход по факту за период</p>
            <p className="text-3xl font-semibold">
              {lessons.reduce(
                (prev, curr) =>
                  prev +
                  curr.attendance.reduce(
                    (prev1, curr1) =>
                      prev1 +
                      (curr1.student.totalLessons !== 0
                        ? curr1.student.totalPayments / curr1.student.totalLessons
                        : 0),
                    0
                  ),
                0
              )}{' '}
              ₽
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
            {lessons?.map((lesson) => (
              <Card key={lesson.id}>
                <CardHeader>
                  <div>
                    {lesson.date.toLocaleDateString('ru-RU')} {lesson.time} -{' '}
                    <b>
                      {lesson.attendance.reduce(
                        (prev1, curr1) =>
                          prev1 +
                          (curr1.student.totalLessons !== 0
                            ? curr1.student.totalPayments / curr1.student.totalLessons
                            : 0),
                        0
                      )}{' '}
                      ₽
                    </b>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul>
                    {lesson.attendance.map((a) => (
                      <li key={a.id}>
                        {a.student.firstName} {a.student.lastName} -{' '}
                        <b>
                          {a.student.totalLessons !== 0
                            ? a.student.totalPayments / a.student.totalLessons
                            : 0}{' '}
                          ₽
                        </b>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
