import { getLessons } from '@/src/actions/lessons'
import { getGroupName } from '@/src/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { endOfMonth, startOfDay, startOfMonth } from 'date-fns'
import { fromZonedTime, toZonedTime } from 'date-fns-tz'
import { lessonKeys } from './keys'

async function getLessonList(organizationId: number, date?: Date) {
  if (!date) {
    throw new Error('Укажите дату')
  }
  const zoned = fromZonedTime(date, 'Europe/Moscow')
  const data = await getLessons({
    where: {
      date: zoned,
      organizationId,
    },
    include: {
      attendance: true,
      group: { include: { course: true, location: true } },
      teachers: { include: { teacher: true } },
    },
    orderBy: { time: 'asc' },
  })

  return data
}

async function getDayStatuses(organizationId: number, date: Date) {
  const from = startOfMonth(date)
  const to = endOfMonth(date)
  const zonedFrom = fromZonedTime(from, 'Europe/Moscow')
  const zonedTo = fromZonedTime(to, 'Europe/Moscow')

  const data = await getLessons({
    where: {
      date: {
        gte: zonedFrom,
        lte: zonedTo,
      },
      organizationId,
    },
    include: {
      attendance: true,
      group: { include: { course: true, location: true } },
      teachers: { include: { teacher: true } },
    },
    orderBy: [{ date: 'asc' }, { time: 'asc' }],
  })

  return data
}

export type LessonListData = Awaited<ReturnType<typeof getLessonList>>

export const useLessonListQuery = (organizationId: number, date: Date) => {
  const dateKey = startOfDay(date).toISOString().split('T')[0]
  return useQuery({
    queryKey: lessonKeys.byDate(organizationId, dateKey),
    queryFn: () => getLessonList(organizationId, date),
    enabled: !!organizationId && !!date,
  })
}

export const useMappedLessonListQuery = (organizationId: number, date?: Date) => {
  const dateKey = date ? startOfDay(date).toISOString().split('T')[0] : ''
  return useQuery({
    queryKey: lessonKeys.byDate(organizationId, dateKey),
    queryFn: () => getLessonList(organizationId, date),
    enabled: !!organizationId && !!date,
    select: (lessons) =>
      lessons.map((lesson) => ({ label: getGroupName(lesson.group), value: lesson.id })),
  })
}

export const useDayStatusesQuery = (organizationId: number, date: Date) => {
  const dateKey = startOfDay(date).toISOString().split('T')[0]
  return useQuery({
    queryKey: lessonKeys.byMonth(organizationId, dateKey),
    queryFn: () => getDayStatuses(organizationId, date),
    enabled: !!organizationId && !!date,
    select: (lessons) => {
      const statuses: Record<string, boolean[]> = {}
      lessons.forEach((lesson) => {
        const day = toZonedTime(new Date(lesson.date), 'Europe/Moscow').toISOString().split('T')[0]
        if (!statuses[day]) {
          statuses[day] = []
        }
        statuses[day].push(lesson.attendance.some((a) => a.status === 'UNSPECIFIED'))
      })
      return statuses
    },
  })
}
