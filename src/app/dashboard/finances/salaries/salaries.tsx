'use client'
import { getLessons } from '@/actions/lessons'
import { getPaychecks } from '@/actions/paycheck'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import { UserDTO } from '@/types/user'
import { PayCheck, Prisma } from '@prisma/client'
import { toZonedTime } from 'date-fns-tz'
import { ru } from 'date-fns/locale'
import { CalendarIcon, ChevronsUpDown, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { type DateRange } from 'react-day-picker'

export default function Salaries({ userId }: { userId?: number }) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const today = new Date()
    return {
      from: new Date(today.getFullYear(), today.getMonth(), 1),
      to: new Date(today.getFullYear(), today.getMonth() + 1, 0),
    }
  })
  const [lessons, setLessons] = useState<
    {
      teacher: UserDTO
      lessons: (Prisma.LessonGetPayload<{
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
        const { startDate, endDate } = {
          startDate: toZonedTime(dateRange.from, 'Europe/Moscow'),
          endDate: toZonedTime(dateRange.to, 'Europe/Moscow'),
        }
        const lessonsData = await getLessons({
          where: {
            date: {
              gte: startDate,
              lte: endDate,
            },
            status: { not: 'CANCELLED' },
            teachers: userId ? { some: { teacherId: userId } } : undefined,
          },
          include: {
            teachers: {
              include: {
                teacher: {
                  include: {
                    role: true,
                  },
                },
              },
            },
            group: {
              include: {
                teachers: true,
              },
            },
          },
          orderBy: { date: 'asc' },
        })
        const paychecksData = await getPaychecks({
          where: {
            date: {
              gte: startDate,
              lte: endDate,
            },
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
            teacher: UserDTO
            lessons: ((typeof lessonsData)[0] & { price: number })[]
          }
        > = {}

        for (const lesson of lessonsData) {
          for (const tl of lesson.teachers) {
            const teacher = tl.teacher

            if (!lessonsByTeacher[teacher.id]) {
              lessonsByTeacher[teacher.id] = {
                teacher: teacher,
                lessons: [],
              }
            }
            lessonsByTeacher[teacher.id].lessons.push({
              ...lesson,
              price: tl.bid,
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
          <Calendar
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={setDateRange}
            locale={ru}
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
                    <CollapsibleTrigger
                      render={<Button variant="ghost" size="icon" className="size-8" />}
                    >
                      <ChevronsUpDown />
                      <span className="sr-only">Toggle</span>
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
                            <CalendarIcon className="text-muted-foreground h-4 w-4" />
                            <span className="font-medium">
                              {toZonedTime(lesson.date, 'Europe/Moscow').toLocaleDateString(
                                'ru-RU',
                                {
                                  day: '2-digit',
                                  month: 'short',
                                }
                              )}
                              {lesson.time && `, ${lesson.time}`}
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
                                {toZonedTime(paycheck.date, 'Europe/Moscow').toLocaleDateString(
                                  'ru-RU',
                                  {
                                    day: '2-digit',
                                    month: 'short',
                                  }
                                )}
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
