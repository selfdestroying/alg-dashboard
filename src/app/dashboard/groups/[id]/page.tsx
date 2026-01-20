import { getGroup } from '@/actions/groups'
import { getUsers } from '@/actions/users'
import { GroupaAttendanceTable } from '@/components/tables/group-attendance-table'
import GroupStudentsTable from '@/components/tables/group-students-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import GroupTeachersTable from './_components/group-teachers-table'
import InfoSection from './_components/info-section'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id
  const group = await getGroup(+id)

  const teachers = await getUsers({
    where: {
      id: { notIn: group.teachers.map((t) => t.teacherId) },
    },
  })

  const lessons = await prisma.lesson.findMany({
    where: { groupId: group.id },
    orderBy: { date: 'asc' },
  })

  const students = await prisma.student.findMany({
    where: {
      groups: { some: { groupId: group.id } },
    },
    include: {
      groups: true,
      attendances: {
        include: {
          lesson: true,
          asMakeupFor: { include: { missedAttendance: { include: { lesson: true } } } },
          missedMakeup: { include: { makeUpAttendance: { include: { lesson: true } } } },
        },
      },
    },
  })

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        <InfoSection group={group} />
        <Card>
          <CardHeader>
            <CardTitle>Преподаватели</CardTitle>
          </CardHeader>
          <CardContent>
            <GroupTeachersTable group={group} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Посещаемость</CardTitle>
        </CardHeader>
        <CardContent>
          <GroupaAttendanceTable data={group} lessons={lessons} students={students} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Список учеников</CardTitle>
        </CardHeader>
        <CardContent>
          <GroupStudentsTable data={students} />
        </CardContent>
      </Card>
    </div>
  )
}
