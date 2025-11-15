'use client'
import { getLessons } from '@/actions/lessons'
import { getPaychecks } from '@/actions/paycheck'
import { UserData } from '@/actions/users'
import { DateRangePicker } from '@/components/date-range-picker'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import { PayCheck, Prisma } from '@prisma/client'
import { ru } from 'date-fns/locale'
import { Calendar, ChevronsUpDown, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { DateRange } from 'react-day-picker'

export default function Salaries({ userId }: { userId?: number }) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [lessons, setLessons] = useState<
    {
      teacher: UserData
      lessons: (Prisma.LessonGetPayload<{
        include: {
          teachers: {
            include: {
              teacher: {
                omit: {
                  password: true
                  passwordRequired: true
                  createdAt: true
                }
              }
            }
          }
          group: true
        }
      }> & { price: number })[]
    }[]
  >([])
  const [paychecks, setPaychecks] = useState<PayCheck[]>([])
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
        const lessonsData = await getLessons({
          where: {
            date: {
              gte: from,
              lte: to,
            },
            status: { not: 'CANCELLED' },
            teachers: userId ? { some: { teacherId: userId } } : undefined,
          },
          include: {
            teachers: {
              include: {
                teacher: {
                  omit: {
                    password: true,
                    passwordRequired: true,
                    createdAt: true,
                  },
                },
              },
            },
            group: {
              include: {
                teachers: {
                  select: {
                    teacherId: true,
                    bidForLesson: true,
                  },
                },
              },
            },
          },
          orderBy: { date: 'asc' },
        })
        const paychecksData = await getPaychecks({
          where: {
            date: {
              gte: from,
              lte: to,
            },
            userId,
          },
        })

        lessonsData.sort((a, b) => {
          const dateA = new Date(a.date)
          const dateB = new Date(b.date)
          if (dateA.getTime() !== dateB.getTime()) return dateA.getTime() - dateB.getTime()
          if (a.time && b.time) {
            const [aH, aM] = a.time.split(':').map(Number)
            const [bH, bM] = b.time.split(':').map(Number)
            return aH * 60 + aM - (bH * 60 + bM)
          }
          return 0
        })

        const lessonsByTeacher: Record<
          number,
          {
            teacher: UserData
            lessons: ((typeof lessonsData)[0] & { price: number })[]
          }
        > = {}

        for (const lesson of lessonsData) {
          for (const tl of lesson.teachers) {
            const teacher = tl.teacher
            const bidForLesson = lesson.group.teachers.find(
              (t) => t.teacherId === tl.teacherId
            )?.bidForLesson
            if (!lessonsByTeacher[teacher.id]) {
              lessonsByTeacher[teacher.id] = {
                teacher: teacher,
                lessons: [],
              }
            }
            lessonsByTeacher[teacher.id].lessons.push({
              ...lesson,
              price:
                bidForLesson ??
                (lesson.group.type == 'GROUP'
                  ? teacher.bidForLesson
                  : lesson.group.type == 'INDIVIDUAL'
                    ? teacher.bidForIndividual
                    : 0),
            })
          }
        }

        const result = Object.values(lessonsByTeacher)
        setLessons(result)
        setPaychecks(paychecksData)
      } else {
        setLessons([])
        setPaychecks([])
      }
    }

    getLessonsFromPeriod()
  }, [dateRange])

  return (
    <Card>
      <CardContent className="space-y-6">
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
          <Button variant="outline" onClick={() => setDateRange(undefined)}>
            Сбросить
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {lessons.map((r) => (
            <Collapsible key={r.teacher.id}>
              <Card className="shadow-sm transition hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2 text-lg">
                    <div className="flex items-center gap-2">
                      <Users className="text-muted-foreground h-5 w-5" />
                      {r.teacher.firstName} {r.teacher.lastName} -{' '}
                      {(
                        r.lessons.reduce((prev, curr) => prev + curr.price, 0) +
                        paychecks
                          .filter((paycheck) => paycheck.userId === r.teacher.id)
                          .reduce((prev, curr) => prev + curr.amount, 0)
                      ).toLocaleString()}{' '}
                      ₽
                    </div>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <ChevronsUpDown />
                        <span className="sr-only">Toggle</span>
                      </Button>
                    </CollapsibleTrigger>
                  </CardTitle>
                </CardHeader>

                <CollapsibleContent>
                  <CardContent className="space-y-3">
                    {r.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="bg-muted/30 hover:bg-muted/50 rounded-lg border p-3 transition"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="text-muted-foreground h-4 w-4" />
                            <span className="font-medium">
                              {lesson.date.toLocaleDateString('ru-RU', {
                                day: '2-digit',
                                month: 'short',
                              })}
                            </span>
                          </div>
                          {lesson.time && (
                            <div className="text-muted-foreground flex items-center gap-1 text-sm">
                              <Badge
                                variant="outline"
                                className={`${lesson.price === 0 && 'border-error bg-error/30'}`}
                              >
                                {lesson.price.toLocaleString()} ₽
                              </Badge>
                            </div>
                          )}
                        </div>

                        <Separator className="my-2" />

                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{lesson.group.name}</span>
                          <Badge variant="outline">{lesson.group.type}</Badge>
                        </div>
                      </div>
                    ))}
                    {paychecks
                      .filter((paycheck) => paycheck.userId == r.teacher.id)
                      .map((paycheck) => (
                        <div
                          key={paycheck.id}
                          className="bg-muted/30 hover:bg-muted/50 rounded-lg border p-3 transition"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Calendar className="text-muted-foreground h-4 w-4" />
                              <span className="font-medium">
                                {paycheck.date.toLocaleDateString('ru-RU', {
                                  day: '2-digit',
                                  month: 'short',
                                })}
                              </span>
                            </div>
                            <div className="text-muted-foreground flex items-center gap-1 text-sm">
                              <Badge
                                variant="outline"
                                className={`${paycheck.amount === 0 && 'border-error bg-error/30'}`}
                              >
                                {paycheck.amount.toLocaleString()} ₽
                              </Badge>
                            </div>
                          </div>

                          <Separator className="my-2" />

                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{paycheck.comment}</span>
                            <Badge variant="outline">Чек</Badge>
                          </div>
                        </div>
                      ))}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
