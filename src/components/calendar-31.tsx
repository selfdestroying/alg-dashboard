'use client'

import { getLessons, LessonWithAttendanceAndGroup } from '@/actions/lessons'
import { Calendar, CalendarDayButton } from '@/components/ui/calendar'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { isToday } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Day } from 'react-day-picker'
import { Button } from './ui/button'

const getDayTimestamp = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()

export default function Calendar31({ selectedTeacherId }: { selectedTeacherId: number }) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [month, setMonth] = useState<Date>(new Date())
  const [lessonsByDay, setLessonsByDay] = useState<Record<number, LessonWithAttendanceAndGroup[]>>(
    {}
  )
  const [selectedDayLessons, setSelectedDayLessons] = useState<LessonWithAttendanceAndGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const todayTimestamp = getDayTimestamp(new Date())

  const getLessonStatus = (lesson: LessonWithAttendanceAndGroup) => {
    const now = new Date()
    const isTodayLesson = isToday(lesson.date)
    const isPastLesson = now > lesson.date

    if (isPastLesson || isTodayLesson) {
      const hasAttendance = lesson.attendance.some((a) => a.status === 'UNSPECIFIED')
      return hasAttendance ? 'bg-error' : 'bg-success'
    }
    return 'bg-info'
  }

  const fetchLessonsForMonth = async (month: Date) => {
    setIsLoading(true)
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1)
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0)
    const lessons = await getLessons({
      where: {
        date: { gte: startOfMonth, lte: endOfMonth },
        group: { teacherId: selectedTeacherId == -1 ? undefined : selectedTeacherId },
      },
    })

    const newLessonsByDay: Record<number, LessonWithAttendanceAndGroup[]> = {}
    lessons.forEach((lesson) => {
      const dayTimestamp = getDayTimestamp(lesson.date)
      if (!newLessonsByDay[dayTimestamp]) {
        newLessonsByDay[dayTimestamp] = []
      }
      newLessonsByDay[dayTimestamp].push(lesson)
    })
    setLessonsByDay(newLessonsByDay)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchLessonsForMonth(month)
  }, [month, selectedTeacherId])

  useEffect(() => {
    if (date) {
      const dayTimestamp = getDayTimestamp(date)
      setSelectedDayLessons(lessonsByDay[dayTimestamp] || [])
    } else {
      setSelectedDayLessons([])
    }
  }, [date, lessonsByDay])

  return (
    <Card className="h-full w-full py-4">
      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-[max-content_1fr]">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          month={month}
          onMonthChange={setMonth}
          className="place-self-center p-0 [--cell-size:--spacing(11)] md:[--cell-size:--spacing(12)]"
          locale={ru}
          showOutsideDays={false}
          components={{
            Day: ({ ...props }) => (
              <Day {...props} className={cn(props.className, 'bg-transparent')} />
            ),
            DayButton: ({ children, day, ...props }) => {
              const dayTimestamp = getDayTimestamp(day.date)
              const lessonsForDay = lessonsByDay[dayTimestamp]
              const hasUnspecifiedAttendance = lessonsForDay?.some((lesson) =>
                lesson.attendance.some((a) => a.status === 'UNSPECIFIED')
              )

              let bg = ''
              if (lessonsForDay) {
                if (todayTimestamp >= dayTimestamp && hasUnspecifiedAttendance) {
                  bg = 'bg-error text-primary-foreground'
                } else if (todayTimestamp >= dayTimestamp) {
                  bg = 'bg-success text-primary-foreground'
                } else {
                  bg = 'bg-info text-primary-foreground'
                }
              }

              return (
                <CalendarDayButton
                  day={day}
                  {...props}
                  className={cn(props.className, bg, 'transition-none')}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : children}
                </CalendarDayButton>
              )
            },
          }}
        />

        <div className="space-y-2">
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
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              selectedDayLessons.map((lesson) => {
                const lessonStatus = getLessonStatus(lesson)
                return (
                  <Button
                    key={lesson.id}
                    variant={'outline'}
                    asChild
                    className={`relative h-fit flex-col items-start justify-start rounded-md border p-2 pl-6 text-sm after:absolute after:inset-y-2 after:left-2 after:w-1 after:rounded-full ${lessonStatus === 'bg-error' ? 'after:bg-error' : ''} ${
                      lessonStatus === 'bg-success' ? 'after:bg-success' : ''
                    } ${lessonStatus === 'bg-info' ? 'after:bg-info' : ''}`}
                  >
                    <Link href={`/dashboard/lessons/${lesson.id}`}>
                      <span className="font-medium">
                        {lesson.group.name} - {lesson.group.teacher.firstName}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {lesson.date.toLocaleDateString('ru-RU')} {lesson.time}
                      </span>
                    </Link>
                  </Button>
                )
              })
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="text-muted-foreground grid grid-cols-3 gap-2 text-xs">
          <div
            className="flex items-center justify-center space-x-1"
            role="region"
            aria-live="polite"
          >
            <span className="bg-success inline-block size-2 rounded-full" aria-hidden="true"></span>
            <span>Завершённые уроки</span>
          </div>
          <div
            className="flex items-center justify-center space-x-1"
            role="region"
            aria-live="polite"
          >
            <span className="bg-error inline-block size-2 rounded-full" aria-hidden="true"></span>
            <span>Неотмеченные уроки</span>
          </div>
          <div
            className="flex items-center justify-center space-x-1"
            role="region"
            aria-live="polite"
          >
            <span className="bg-info inline-block size-2 rounded-full" aria-hidden="true"></span>
            <span>Будущие уроки</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
