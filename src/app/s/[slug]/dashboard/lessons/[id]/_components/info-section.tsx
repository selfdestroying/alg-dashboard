import { Prisma } from '@/prisma/generated/client'
import { LessonStatus } from '@/prisma/generated/enums'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { getGroupName } from '@/src/lib/utils'
import { cva } from 'class-variance-authority'
import { toZonedTime } from 'date-fns-tz'
import { Book, Clock, MapPin, Users } from 'lucide-react'
import Link from 'next/link'
import EditLessonButton from './edit-lesson-button'

export const lessonStatusMap: Record<LessonStatus, string> = {
  ACTIVE: 'Активен',
  CANCELLED: 'Отменен',
}

export const lessonStatusVariants = cva('', {
  variants: {
    status: {
      ACTIVE: 'text-success',
      CANCELLED: 'text-destructive',
    },
  },
  defaultVariants: {
    status: 'ACTIVE',
  },
})

interface InfoSectionsProps {
  lesson: Prisma.LessonGetPayload<{
    include: {
      group: {
        include: {
          _count: { select: { students: true } }
          course: true
          location: true
        }
      }
      attendance: true
    }
  }>
}

export default function InfoSection({ lesson }: InfoSectionsProps) {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>Информация об уроке</CardTitle>
        <CardAction>
          <EditLessonButton lesson={lesson} />
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 truncate sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col">
            <div className="text-muted-foreground/60 flex items-center gap-2 text-xs font-medium">
              <Book className="h-3 w-3" />
              <span className="truncate" title="Курс">
                Группа
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Link
                href={`/dashboard/groups/${lesson.group.id}`}
                className="text-primary truncate hover:underline"
              >
                {getGroupName(lesson.group)}
              </Link>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="text-muted-foreground/60 flex items-center gap-2 text-xs font-medium">
              <Clock className="h-3 w-3" />
              <span className="truncate" title="Время">
                Время
              </span>
            </div>
            <div className="truncate">{lesson.time}</div>
          </div>

          <div className="flex flex-col">
            <div className="text-muted-foreground/60 flex items-center gap-2 text-xs font-medium">
              <Clock className="h-3 w-3" />
              <span className="truncate" title="Время">
                Дата
              </span>
            </div>
            <div className="truncate">
              {toZonedTime(lesson.date, 'Europe/Moscow').toLocaleDateString('ru-RU')}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="text-muted-foreground/60 flex items-center gap-2 text-xs font-medium">
              <MapPin className="h-3 w-3" />
              <span className="truncate" title="Локация">
                Локация
              </span>
            </div>
            <div className="truncate">{lesson.group.location?.name}</div>
          </div>

          <div className="flex flex-col">
            <div className="text-muted-foreground/60 flex items-center gap-2 text-xs font-medium">
              <Users className="h-3 w-3" />
              <span className="truncate" title="Количество учеников">
                Количество учеников
              </span>
            </div>
            <div className="truncate">
              {lesson.attendance.length}/{lesson.group.maxStudents}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="text-muted-foreground/60 flex items-center gap-2 text-xs font-medium">
              <Users className="h-3 w-3" />
              <span className="truncate" title="Количество учеников">
                Статус
              </span>
            </div>
            <div className={lessonStatusVariants({ status: lesson.status })}>
              {lessonStatusMap[lesson.status]}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
