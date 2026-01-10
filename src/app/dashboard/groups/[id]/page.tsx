import { getGroup } from '@/actions/groups'
import { getMe, getUsers } from '@/actions/users'
import { GroupStudentDialog } from '@/components/group-student-dialog'
import { GroupaAttendanceTable } from '@/components/tables/group-attendance-table'
import { GroupStudentsTable } from '@/components/tables/group-students-table'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import prisma from '@/lib/prisma'
import AddTeacherToGroupButton from './_components/add-teacher-to-group-button'
import GroupTeachersTable from './_components/group-teachers-table'
import InfoSection from './_components/info-section'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id
  const group = await getGroup(+id)

  const me = await getMe()
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
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        <InfoSection group={group} />
        <Card>
          <CardHeader>
            <CardTitle>Преподаватели</CardTitle>
            {me?.role !== 'TEACHER' && (
              <CardAction title="Добавить преподавателя">
                <AddTeacherToGroupButton teachers={teachers} group={group} />
              </CardAction>
            )}
          </CardHeader>
          <CardContent>
            <GroupTeachersTable group={group} />
          </CardContent>
        </Card>
      </div>
      <div className="mt-6 grid gap-2 md:grid-cols-2">{/* <InfoSection group={group} /> */}</div>
      <GroupStudentDialog
        students={students.filter(
          (student) =>
            student.groups.length == 0 || student.groups.find((s) => s.groupId != group.id)
        )}
        groupId={group.id}
      />
      <GroupaAttendanceTable
        data={group}
        lessons={lessons}
        students={students.filter((student) => student.groups.find((s) => s.groupId === group.id))}
      />
      <GroupStudentsTable
        data={group}
        students={students.filter((student) => student.groups.find((s) => s.groupId === group.id))}
      />
    </div>
  )
}
