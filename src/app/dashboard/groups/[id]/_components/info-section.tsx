import { getGroup } from '@/actions/groups'
import { getMe } from '@/actions/users'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DaysOfWeek } from '@/lib/utils'
import { GroupType } from '@prisma/client'
import { toZonedTime } from 'date-fns-tz'
import { Book, Calendar, Clock, MapPin, Tag, Users } from 'lucide-react'
import EditGroupButton from './edit-group-button'

const groupTypeMap: Record<GroupType, string> = {
  GROUP: 'Группа',
  INDIVIDUAL: 'Индив.',
  INTENSIVE: 'Интенсив',
}

export default async function InfoSection({
  group,
}: {
  group: Awaited<ReturnType<typeof getGroup>>
}) {
  const me = await getMe()
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>Информация о группе</CardTitle>
        {me?.role !== 'TEACHER' && (
          <CardAction title="Редактировать группу">
            <EditGroupButton group={group} />
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col">
            <div className="text-muted-foreground/60 flex items-center gap-2 text-xs font-medium uppercase">
              <Book className="h-3 w-3" />
              Курс
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="truncate text-sm font-semibold">{group.course.name}</div>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="text-muted-foreground/60 flex items-center gap-2 text-xs font-medium uppercase">
              <Calendar className="h-3 w-3" />
              День занятия
            </div>
            <div className="truncate text-sm font-semibold">
              {group.dayOfWeek ? DaysOfWeek.long[group.dayOfWeek] : '-'}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="text-muted-foreground/60 flex items-center gap-2 text-xs font-medium uppercase">
              <Clock className="h-3 w-3" />
              Время
            </div>
            <div className="truncate text-sm font-semibold">{group.time}</div>
          </div>

          <div className="flex flex-col">
            <div className="text-muted-foreground/60 flex items-center gap-2 text-xs font-medium uppercase">
              <MapPin className="h-3 w-3" />
              Локация
            </div>
            <div className="truncate text-sm font-semibold">{group.location?.name}</div>
          </div>

          <div className="flex flex-col">
            <div className="text-muted-foreground/60 flex items-center gap-2 text-xs font-medium uppercase">
              <Tag className="h-3 w-3" />
              Тип
            </div>
            <div className="truncate text-sm font-semibold">
              {group.type ? groupTypeMap[group.type] : '-'}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="text-muted-foreground/60 flex items-center gap-2 text-xs font-medium uppercase">
              <Users className="h-3 w-3" />
              Количество учеников
            </div>
            <div className="truncate text-sm font-semibold">{group.students.length}/12</div>
          </div>

          <div className="flex flex-col">
            <div className="text-muted-foreground/60 flex items-center gap-2 text-xs font-medium uppercase">
              <Calendar className="h-3 w-3" />
              Дата старта
            </div>
            <div className="truncate text-sm font-semibold">
              {toZonedTime(group.startDate, 'Europe/Moscow').toLocaleDateString('ru-RU')}
              {group?.endDate
                ? ` — ${toZonedTime(group.endDate, 'Europe/Moscow').toLocaleDateString('ru-RU')}`
                : ''}{' '}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
