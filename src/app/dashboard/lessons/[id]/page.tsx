import { getStudents } from '@/actions/students'
import { getMe, getUsers } from '@/actions/users'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import AttendanceTable from './_components/attendance-table'
import InfoSection from './_components/info-section'
import TeachersSection from './_components/teachers-sections'

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
  const user = await getMe()
  if (!lesson) {
    return <div>Ошибка при получении урока</div>
  }

  return (
    <div className="space-y-2">
      <div className="grid gap-2 md:grid-cols-2">
        <InfoSection lesson={lesson} />
        <TeachersSection />
      </div>
      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Список учеников</CardTitle>
        </CardHeader>
        <CardContent>
          <AttendanceTable data={lesson.attendance} />
        </CardContent>
      </Card>
    </div>
  )
}
