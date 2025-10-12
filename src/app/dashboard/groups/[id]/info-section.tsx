import { getGroup } from '@/actions/groups'
import { getUser, getUsers } from '@/actions/users'
import TeachersMultiSelect from '@/components/teachers-multiselect'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { format } from 'date-fns'
import { BookOpen, Calendar, CircleAlert, Clock, ExternalLink, User, Users } from 'lucide-react'
import { Fragment } from 'react'
import TeacherGroupBids from './teacher-group-bids'

export default async function InfoSection({
  group,
}: {
  group: Awaited<ReturnType<typeof getGroup>>
}) {
  const user = await getUser()
  const teachers = await getUsers()
  return (
    <Card className="flex flex-col rounded-lg border has-data-[slot=month-view]:flex-1">
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {/* Group Name */}
          <div className="space-y-1">
            <div className="text-muted-foreground/60 flex items-center gap-1 text-xs font-medium tracking-wide uppercase">
              <BookOpen className="h-3 w-3" />
              Название
            </div>
            <p className="flex items-center text-sm font-semibold">
              {group.name}{' '}
              <Button variant={'link'} size={'icon'} asChild className="h-full">
                <a target="_blank" rel="noopener noreferrer" href={group.backOfficeUrl ?? '#'}>
                  <ExternalLink />
                </a>
              </Button>
            </p>
          </div>

          {/* Course */}
          <div className="space-y-1">
            <div className="text-muted-foreground/60 flex items-center gap-1 text-xs font-medium tracking-wide uppercase">
              <BookOpen className="h-3 w-3" />
              Курс
            </div>
            <p className="text-sm font-semibold">{group.course.name}</p>
          </div>

          {/* Group Type */}
          <div className="space-y-1">
            <div className="text-muted-foreground/60 flex items-center gap-1 text-xs font-medium tracking-wide uppercase">
              <Users className="h-3 w-3" />
              Тип группы
            </div>
            <div>
              <Badge variant="secondary" className="px-2 py-0.5 text-xs">
                {group.type ?? 'Не указано'}
              </Badge>
            </div>
          </div>

          {/* Class Schedule */}
          <div className="space-y-1">
            <div className="text-muted-foreground/60 flex items-center gap-1 text-xs font-medium tracking-wide uppercase">
              <Clock className="h-3 w-3" />
              Время
            </div>
            <p className="text-sm font-semibold">{group.time ?? 'Не указано'}</p>
          </div>

          {/* Start Date */}
          <div className="space-y-1">
            <div className="text-muted-foreground/60 flex items-center gap-1 text-xs font-medium tracking-wide uppercase">
              <Calendar className="h-3 w-3" />
              Дата старта
            </div>
            <p className="text-sm font-semibold">
              {group.startDate ? format(group.startDate, 'dd-MM-yyyy') : 'Не указано'}
            </p>
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-muted-foreground/60 flex items-center gap-1 text-xs font-medium tracking-wide uppercase">
            <User className="h-3 w-3" />
            Преподаватели
          </div>
          <TeachersMultiSelect
            teachers={teachers.map((teacher) => ({
              value: teacher.id.toString(),
              label: `${teacher.firstName} ${teacher.lastName ?? ''}`,
            }))}
            currentTeachers={group.teachers.map((teacher) => ({
              value: teacher.teacher.id.toString(),
              label: `${teacher.teacher.firstName} ${teacher.teacher.lastName ?? ''}`,
            }))}
            groupId={group.id}
          />
          <Badge className="text-warning" variant={'outline'}>
            <CircleAlert />
            Изменение списка учителей в группе так же будет применено и ко всем урокам в этой
            группе, начиная с текущей даты.
          </Badge>
          {(user?.role == 'ADMIN' || user?.role == 'OWNER') && (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {group.teachers.map((teacher) => (
                <Fragment key={teacher.teacherId}>
                  <TeacherGroupBids
                    user={teacher.teacher}
                    bidForLesson={teacher.bidForLesson}
                    group={group}
                  />
                </Fragment>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
