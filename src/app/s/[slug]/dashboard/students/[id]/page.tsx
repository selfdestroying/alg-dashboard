import { getGroups } from '@/src/actions/groups'
import { getStudent, getStudentLessonsBalanceHistory } from '@/src/actions/students'
import { Avatar, AvatarFallback } from '@/src/components/ui/avatar'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { auth } from '@/src/lib/auth'
import { getFullName, protocol, rootDomain } from '@/src/lib/utils'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import EditStudentDialog from './_components/edit-student-dialog'
import LessonsBalanceHistory from './_components/lessons-balance-history'
import StudentCard from './_components/student-card'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({
    headers: requestHeaders,
  })
  if (!session) {
    redirect(`${protocol}://auth.${rootDomain}/sign-in`)
  }
  const { id } = await params
  const student = await getStudent({
    where: { id: Number(id), organizationId: session.members[0].organizationId },
    include: {
      groups: {
        include: {
          group: {
            include: {
              lessons: {
                orderBy: { date: 'asc' },
              },
              course: true,
              location: true,
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
      organizationId: session.members[0].organizationId,
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

  const { success: canEdit } = await auth.api.hasPermission({
    headers: requestHeaders,
    body: {
      permission: { student: ['update'] },
    },
  })

  const { success: canEditLessonsHistory } = await auth.api.hasPermission({
    headers: requestHeaders,
    body: {
      permission: { lessonStudentHistory: ['update'] },
    },
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
          {canEdit && (
            <CardAction>
              <EditStudentDialog student={student} />
            </CardAction>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <StudentCard student={student} groups={groups} />
          {canEditLessonsHistory && <LessonsBalanceHistory history={lessonsBalanceHistory} />}
        </CardContent>
      </Card>
    </div>
  )
}
