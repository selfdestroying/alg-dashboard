import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { DaysOfWeek } from '@/src/lib/utils'
import { GroupDTO } from '@/types/group'
import { GroupType } from '@prisma/client'
import { toZonedTime } from 'date-fns-tz'
import { Book, Calendar, Clock, ExternalLink, MapPin, Tag, Users } from 'lucide-react'
import EditGroupButton from './edit-group-button'

const groupTypeMap: Record<GroupType, string> = {
  GROUP: 'Группа',
  INDIVIDUAL: 'Индив.',
  INTENSIVE: 'Интенсив',
}

export default async function InfoSection({ group }: { group: GroupDTO }) {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>Информация о группе</CardTitle>
        <CardAction>
          <EditGroupButton group={group} />
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 truncate sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col">
            <div className="text-muted-foreground/60 flex items-center gap-2 text-xs font-medium">
              <Book className="h-3 w-3" />
              <span className="truncate" title="Курс">
                Курс
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="truncate">{group.course.name}</div>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="text-muted-foreground/60 flex items-center gap-2 text-xs font-medium">
              <Calendar className="h-3 w-3" />
              <span className="truncate" title="День занятия">
                День занятия
              </span>
            </div>
            <div className="truncate">
              {group.dayOfWeek != null ? DaysOfWeek.full[group.dayOfWeek] : '-'}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="text-muted-foreground/60 flex items-center gap-2 text-xs font-medium">
              <Clock className="h-3 w-3" />
              <span className="truncate" title="Время">
                Время
              </span>
            </div>
            <div className="truncate">{group.time}</div>
          </div>

          <div className="flex flex-col">
            <div className="text-muted-foreground/60 flex items-center gap-2 text-xs font-medium">
              <MapPin className="h-3 w-3" />
              <span className="truncate" title="Локация">
                Локация
              </span>
            </div>
            <div className="truncate">{group.location?.name}</div>
          </div>

          <div className="flex flex-col">
            <div className="text-muted-foreground/60 flex items-center gap-2 text-xs font-medium">
              <Tag className="h-3 w-3" />
              <span className="truncate" title="Тип">
                Тип
              </span>
            </div>
            <div className="truncate">{group.type ? groupTypeMap[group.type] : '-'}</div>
          </div>

          <div className="flex flex-col">
            <div className="text-muted-foreground/60 flex items-center gap-2 text-xs font-medium">
              <Users className="h-3 w-3" />
              <span className="truncate" title="Количество учеников">
                Количество учеников
              </span>
            </div>
            <div className="truncate">
              {group.students.length}/{group.maxStudents}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="text-muted-foreground/60 flex items-center gap-2 text-xs font-medium">
              <Calendar className="h-3 w-3" />
              <span className="truncate" title="Период">
                Период
              </span>
            </div>
            <div className="truncate">
              {toZonedTime(group.startDate, 'Europe/Moscow').toLocaleDateString('ru-RU')}
              {group?.endDate
                ? ` - ${toZonedTime(group.endDate, 'Europe/Moscow').toLocaleDateString('ru-RU')}`
                : ''}{' '}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-muted-foreground/60 flex items-center gap-2 text-xs font-medium">
              <ExternalLink className="h-3 w-3" />
              <span className="truncate" title="Ссылка в amoCRM">
                Ссылка в БО
              </span>
            </div>
            <div className="text-primary truncate hover:underline">
              {group.backOfficeUrl ? (
                <a
                  href={group.backOfficeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={group.backOfficeUrl}
                >
                  {group.backOfficeUrl}
                </a>
              ) : (
                '-'
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
