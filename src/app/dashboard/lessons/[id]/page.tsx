import { getStudents } from '@/actions/students'
import { getUser, getUsers } from '@/actions/users'
import { AttendanceDialog } from '@/components/attendance-dialog'
import { AttendanceTable } from '@/components/tables/attendance-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import prisma from '@/lib/prisma'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id
  const lesson = await prisma.lesson.findFirst({
    where: { id: +id },
    include: {
      teachers: {
        include: {
          teacher: {
            omit: {
              password: true,
              passwordRequired: true,
              createdAt: true,
            },
          },
        },
      },
      group: {
        include: {
          _count: { select: { students: true } },
          students: { include: { student: true } },
        },
      },
      attendance: {
        where: {
          NOT: {
            AND: [
              { status: 'UNSPECIFIED' },
              { student: { groups: { some: { status: 'DISMISSED' } } } },
            ],
          },
        },
        include: {
          student: true,
          asMakeupFor: { include: { missedAttendance: { include: { lesson: true } } } },
          missedMakeup: { include: { makeUpAttendance: { include: { lesson: true } } } },
        },
        orderBy: {
          id: 'asc',
        },
      },
    },
  })
  const students = await getStudents({
    where: {
      id: { notIn: lesson?.attendance.map((a) => a.studentId) },
    },
  })
  const teachers = await getUsers()
  const user = await getUser()
  if (!lesson) {
    return <div>Ошибка при получении урока</div>
  }

  return (
    <div className="space-y-2">
      {/* <Card className="flex flex-col rounded-lg border has-data-[slot=month-view]:flex-1">
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
            <div className="space-y-1">
              <div className="text-muted-foreground/60 flex items-center gap-1 text-xs font-medium tracking-wide uppercase">
                <BookOpen className="h-3 w-3" />
                Группа
              </div>
              <Button asChild variant={'link'} className="h-fit p-0 font-medium">
                <Link href={`/dashboard/groups/${lesson.group.id}`}>{lesson.group.name}</Link>
              </Button>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground/60 flex items-center gap-1 text-xs font-medium tracking-wide uppercase">
                <Clock className="h-3 w-3" />
                Время
              </div>
              <p className="text-sm font-semibold">{lesson.time}</p>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground/60 flex items-center gap-1 text-xs font-medium tracking-wide uppercase">
                <Dot className="h-3 w-3" />
                Статус
              </div>
              <Badge variant={'outline'}>
                <div className="bg-success size-1.5 rounded-full" aria-hidden="true"></div>
                {lesson.status}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground/60 flex items-center gap-1 text-xs font-medium tracking-wide uppercase">
                <Calendar className="h-3 w-3" />
                Дата
              </div>
              <p className="text-sm font-semibold">{lesson.date.toLocaleDateString('ru-RU')}</p>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground/60 flex items-center gap-1 text-xs font-medium tracking-wide uppercase">
                <User className="h-3 w-3" />
                Учеников в группе
              </div>
              <p className="text-sm font-semibold">{lesson.group._count.students}</p>
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
              currentTeachers={lesson.teachers.map((teacher) => ({
                value: teacher.teacher.id.toString(),
                label: `${teacher.teacher.firstName} ${teacher.teacher.lastName ?? ''}`,
              }))}
              lessonId={lesson.id}
            />
          </div>
        </CardContent>
      </Card> */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Информация о уроке</CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Преподаватели</CardTitle>
          </CardHeader>
        </Card>
      </div>
      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Список учеников</CardTitle>
          {user?.role !== 'TEACHER' && (
            <AttendanceDialog students={students} lessonId={lesson.id} />
          )}
        </CardHeader>
        <CardContent>
          <AttendanceTable attendance={lesson.attendance} />
        </CardContent>
      </Card>
    </div>
  )
}
