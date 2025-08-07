'use client'

import { getLessons, LessonWithAttendanceAndGroup } from '@/actions/lessons'
import { Calendar, CalendarDayButton } from '@/components/ui/calendar'
import { Card, CardContent } from '@/components/ui/card'
import { ru } from 'date-fns/locale'
import { useEffect, useState } from 'react'

const events = [
  {
    title: 'Team Sync Meeting',
    from: '2025-06-12T09:00:00',
    to: '2025-06-12T10:00:00',
  },
  {
    title: 'Design Review',
    from: '2025-06-12T11:30:00',
    to: '2025-06-12T12:30:00',
  },
  {
    title: 'Client Presentation',
    from: '2025-06-12T14:00:00',
    to: '2025-06-12T15:00:00',
  },
]

const getDayTimestamp = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()

export default function Calendar31() {
  const [date, setDate] = useState<Date | undefined>()
  const [month, setMonth] = useState<Date | undefined>(new Date())
  const [lessonsTimestamps, setlessonsTimestamps] = useState<number[]>([])
  const [selectedDayLessons, setSelectedDayLessons] = useState<LessonWithAttendanceAndGroup[]>([])
  const todayTimestamp = getDayTimestamp(new Date())

  useEffect(() => {
    const value = new Date()
    const startOfMonth = new Date(value.getFullYear(), value.getMonth(), 1)
    const endOfMonth = new Date(value.getFullYear(), value.getMonth() + 1, 0)
    getLessons({ where: { date: { gte: startOfMonth, lte: endOfMonth } } }).then((res) =>
      setlessonsTimestamps(res.flatMap((lesson) => lesson.date.getTime()))
    )
  }, [])

  const onSelect = (value: Date | undefined) => {
    if (value) {
      getLessons({
        where: {
          date: { equals: new Date(value.getFullYear(), value.getMonth(), value.getDate()) },
        },
      }).then((res) => setSelectedDayLessons(res))
      setDate(value)
    }
  }
  const onMonthChange = (value: Date) => {
    const startOfMonth = new Date(value.getFullYear(), value.getMonth(), 1)
    const endOfMonth = new Date(value.getFullYear(), value.getMonth() + 1, 0)
    getLessons({ where: { date: { gte: startOfMonth, lte: endOfMonth } } }).then((res) =>
      setlessonsTimestamps(res.flatMap((lesson) => lesson.date.getTime()))
    )
    setMonth(value)
  }

  return (
    <Card className="h-full w-full py-4">
      <CardContent className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-3">
        <div className="col-span-1 space-y-2">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onSelect}
            month={month}
            onMonthChange={onMonthChange}
            className="w-full space-y-4 p-0"
            locale={ru}
            showOutsideDays={false}
            components={{
              DayButton: ({ children, modifiers, day, ...props }) => {
                const dayTimestamp = getDayTimestamp(day.date)
                const isLessonDay = lessonsTimestamps.includes(dayTimestamp)

                let bg = ''
                if (isLessonDay) {
                  if (todayTimestamp === dayTimestamp) {
                    bg = 'bg-error'
                  } else if (todayTimestamp > dayTimestamp) {
                    bg = 'bg-success'
                  } else {
                    bg = 'bg-info'
                  }
                }

                return (
                  <CalendarDayButton day={day} modifiers={modifiers} {...props} className={bg}>
                    {children}
                  </CalendarDayButton>
                )
              },
            }}
            footer={
              <div className="grid grid-cols-3">
                <div
                  className="text-muted-foreground text-center text-xs"
                  role="region"
                  aria-live="polite"
                >
                  <span
                    className="inline-block size-2 rounded-full bg-success"
                    aria-hidden="true"
                  ></span>{' '}
                  Прошедшие уроки
                </div>
                <div
                  className="text-muted-foreground text-center text-xs"
                  role="region"
                  aria-live="polite"
                >
                  <span
                    className="inline-block size-2 rounded-full bg-error"
                    aria-hidden="true"
                  ></span>{' '}
                  Не отмеченные уроки
                </div>
                <div
                  className="text-muted-foreground text-center text-xs"
                  role="region"
                  aria-live="polite"
                >
                  <span
                    className="inline-block size-2 rounded-full bg-info"
                    aria-hidden="true"
                  ></span>{' '}
                  Будущие уроки
                </div>
              </div>
            }
          />
        </div>
        <div className="col-span-2 space-y-2">
          <div className="flex w-full items-center justify-between px-1">
            <div className="text-sm font-medium">
              {date?.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </div>
          </div>
          <div className="flex w-full flex-col gap-2">
            {selectedDayLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-muted relative rounded-md p-2 pl-6 text-sm after:absolute after:inset-y-2 after:left-2 after:w-1 after:rounded-full after:bg-red-500/70"
              >
                <div className="font-medium">{lesson.group.name}</div>
                <div className="text-muted-foreground text-xs">
                  {lesson.date.toLocaleDateString('ru-RU')} {lesson.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
