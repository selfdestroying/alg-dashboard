import { DayOfWeek, IGroup } from '@/types/group'
import StudentGroupDialog from '@/components/student-group-dialog'
import { IStudent } from '@/types/student'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BookOpen,
  Calendar,
  CalendarDays,
  Link as LinkIcon,
  Timer,
  User,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import GroupDialog from '@/components/group/group-dialog'
import AttendanceForm from '@/components/student/attendance-form'
import { getUser } from '@/lib/dal'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import StudentTable from '@/components/student/student-table'
import LessonDialog from '@/components/lesson/lesson-dialog'
import { redirect } from 'next/navigation'
import { apiGet } from '@/lib/api/api-server'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const user = await getUser()
  if (!user) {
    return redirect('/auth')
  }

  const id = (await params).id
  const group = await apiGet<IGroup>(`groups/${id}`)
  if (!group.success) {
    return (
      <Card>
        <CardHeader className="gap-0 justify-center">
          Ошибка при получении группы: {group.message}
        </CardHeader>
      </Card>
    )
  }

  const students = await apiGet<IStudent[]>(`students`)

  return (
    <div className="space-y-4">
      <div className="flex lg:flex-row flex-col gap-4">
        <Card className="flex-1/2 gap-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Информация о группе
                </CardTitle>
              </div>
              <GroupDialog group={group.data} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  Название группы
                </div>
                <p className="font-semibold">{group.data.name}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  Курс
                </div>
                <p className="font-semibold">{group.data.course}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <User className="h-4 w-4" />
                  Учитель
                </div>
                <p className="font-semibold">{group.data.teacher.name}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  День занятия
                </div>
                <p className="font-semibold">{DayOfWeek[group.data.lessonDay]}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Timer className="h-4 w-4" />
                  Время занятия
                </div>
                <p className="font-semibold">{group.data.lessonTime}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Старт группы
                </div>
                <p className="font-semibold">
                  {new Date(group.data.startDate).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className="">
                <Button asChild variant={'link'} className="p-0 has-[>svg]:px-0">
                  <Link href={group.data.backOfficeUrl}>
                    <LinkIcon className="h-4 w-4" />
                    BackOffice Url
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1/2 gap-2">
          {students.success ? (
            <>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Ученики
                    </CardTitle>
                  </div>

                  <StudentGroupDialog
                    students={students.data.filter(
                      (s) => !group.data.students.some((gs) => gs.id === s.id)
                    )}
                    groupId={id}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <StudentTable data={group.data.students} inGroup isAuthenticated={Boolean(user)} />
              </CardContent>
            </>
          ) : (
            <CardHeader>Ошибка при получении учеников: {students.message}</CardHeader>
          )}
        </Card>
      </div>
      <Card className="gap-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Расписание
            </CardTitle>
            <LessonDialog groupId={group.data.id} />
          </div>
        </CardHeader>
        <CardContent>
          <div>
            <Accordion type="single" collapsible className="space-y-2">
              {group.data.lessons.map((l) => (
                <AccordionItem key={l.id} value={l.id.toString()} className="border-0">
                  <Card className="gap-2 p-0">
                    <AccordionTrigger className="cursor-pointer py-2 px-4">
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="m-0">{format(l.date, 'dd.MM')}</CardTitle>
                        <Badge variant={'secondary'}>{l.time.slice(0, l.time.length - 3)}</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-0">
                      <CardContent className="space-y-3 p-4">
                        <AttendanceForm lesson={l} user={user} />
                      </CardContent>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
