import { getGroups } from '@/actions/groups'
import { getStudent, getStudentLessonsBalanceHistory } from '@/actions/students'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getFullName } from '@/lib/utils'
import EditStudentDialog from './_components/edit-student-dialog'
import LessonsBalanceHistory from './_components/lessons-balance-history'
import StudentCard from './_components/student-card'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const student = await getStudent({
    where: { id: Number(id) },
    include: {
      groups: {
        include: {
          group: {
            include: {
              lessons: {
                orderBy: { date: 'asc' },
              },
            },
          },
        },
      },
      attendances: {
        include: {
          lesson: true,
          asMakeupFor: { include: { missedAttendance: { include: { lesson: true } } } },
          missedMakeup: { include: { makeUpAttendance: { include: { lesson: true } } } },
        },
      },
    },
  })

  if (!student) return <div>Ошибка при получении ученика</div>

  const lessonsBalanceHistory = await getStudentLessonsBalanceHistory(student.id, 50)

  const groups = await getGroups({
    where: {
      students: { none: { studentId: student.id } },
    },
    include: {
      students: true,
      course: true,
      location: true,
      teachers: {
        include: {
          teacher: true,
        },
      },
    },
    orderBy: [
      {
        dayOfWeek: 'asc',
      },
      {
        time: 'asc',
      },
    ],
  })

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1">
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarFallback>
                  {student.firstName?.[0]?.toUpperCase()}
                  {student.lastName?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {getFullName(student.firstName, student.lastName)}
            </div>
          </CardTitle>
          <CardAction>
            <EditStudentDialog student={student} />
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-6">
          <StudentCard student={student} groups={groups} />
          <LessonsBalanceHistory history={lessonsBalanceHistory} />
        </CardContent>
      </Card>
    </div>
  )
}
