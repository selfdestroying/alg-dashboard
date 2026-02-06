import { getStudents } from '@/src/actions/students'
import { getUsers } from '@/src/actions/users'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import prisma from '@/src/lib/prisma'
import AddAttendanceButton from './_components/add-attendance-button'
import AddTeacherToLessonButton from './_components/add-teacher-to-lesson-button'
import AttendanceTable from './_components/attendance-table'
import InfoSection from './_components/info-section'
import LessonTeachersTable from './_components/lesson-teachers-table'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id
  const lesson = await prisma.lesson.findFirst({
    where: { id: +id },
    include: {
      teachers: {
        include: {
          teacher: true,
        },
      },
      group: {
        include: {
          _count: { select: { students: true } },
          students: { include: { student: true } },
          course: true,
          location: true,
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
              group: {
                include: {
                  course: true,
                  location: true,
                },
              },
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

  if (!lesson) {
    return <div>Ошибка при получении урока</div>
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        <InfoSection lesson={lesson} />
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">Преподаватели</CardTitle>
            <CardAction>
              <AddTeacherToLessonButton teachers={teachers} lesson={lesson} />
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-2">
            <LessonTeachersTable data={lesson.teachers} />
          </CardContent>
        </Card>
      </div>
      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Список учеников</CardTitle>
          <CardAction>
            <AddAttendanceButton lessonId={lesson.id} students={students} />
          </CardAction>
        </CardHeader>
        <CardContent>
          <AttendanceTable data={lesson.attendance} />
        </CardContent>
      </Card>
    </div>
  )
}
