import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DayOfWeek, GroupType, IGroup } from '@/types/group'
import { ApiResponse } from '@/types/response'
import { BookOpen, ExternalLink, User, Users, CalendarDays, Clock, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { apiGet } from '@/actions/api'

export default async function InfoSection({ group }: { group: IGroup }) {
  return (
    <Card className="flex flex-col rounded-lg border has-data-[slot=month-view]:flex-1">
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Group Name */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground/60 uppercase tracking-wide">
              <BookOpen className="h-3 w-3" />
              Название
            </div>
            <p className="text-sm font-semibold flex items-center">
              {group.name}{' '}
              <Button variant={'link'} size={'icon'} asChild className="h-full">
                <a target="_blank" rel="noopener noreferrer" href={group.backOfficeUrl}>
                  <ExternalLink />
                </a>
              </Button>
            </p>
          </div>

          {/* Teacher */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground/60 uppercase tracking-wide">
              <User className="h-3 w-3" />
              Преподаватель
            </div>
            <p className="text-sm font-semibold">{group.user.name}</p>
          </div>

          {/* Course */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground/60 uppercase tracking-wide">
              <BookOpen className="h-3 w-3" />
              Курс
            </div>
            <p className="text-sm font-semibold">{group.course}</p>
          </div>

          {/* Group Type */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground/60 uppercase tracking-wide">
              <Users className="h-3 w-3" />
              Тип группы
            </div>
            <div>
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                {GroupType[group.type]}
              </Badge>
            </div>
          </div>

          {/* Class Schedule */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground/60 uppercase tracking-wide">
              <CalendarDays className="h-3 w-3" />
              День недели
            </div>
            <p className="text-sm font-semibold">{DayOfWeek[group.lessonDay]}</p>
          </div>

          {/* Class Time */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground/60 uppercase tracking-wide">
              <Clock className="h-3 w-3" />
              Время
            </div>
            <p className="text-sm font-semibold">
              {group.lessonTime.slice(0, group.lessonTime.length - 3)}
            </p>
          </div>

          {/* Start Date */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground/60 uppercase tracking-wide">
              <Calendar className="h-3 w-3" />
              Дата старта
            </div>
            <p className="text-sm font-semibold">
              {format(new Date(group.startDate), 'dd-MM-yyyy')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
