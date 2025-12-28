import { getStudents } from '@/actions/students'
import { getUserByAuth, getUsers } from '@/actions/users'
import { AttendanceTable } from '@/components/tables/attendance-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import prisma from '@/lib/prisma'
import AttendanceDialog from './attendance-dialog'
import InfoSection from './info-section'
import TeachersSection from './teachers-sections'

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
          lesson: {
            include: {
              group: true,
            },
          },
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
  const teachers = await getUsers({
    where: {
      id: { notIn: lesson?.teachers.map((t) => t.teacherId) },
    },
  })
  const user = await getUserByAuth()
  if (!lesson) {
    return <div>Ошибка при получении урока</div>
  }

  return (
    <div className="space-y-2">
      <div className="mt-6 grid gap-2 md:grid-cols-2">
        <InfoSection lesson={lesson} />
        <TeachersSection teachers={teachers} currentTeachers={lesson.teachers} lesson={lesson} />
      </div>
      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Список учеников</CardTitle>
          {user?.role !== 'TEACHER' && (
            <AttendanceDialog lessonId={lesson.id} students={students} />
          )}
        </CardHeader>
        <CardContent>
          <AttendanceTable attendance={lesson.attendance} />
        </CardContent>
      </Card>
    </div>
  )
}
