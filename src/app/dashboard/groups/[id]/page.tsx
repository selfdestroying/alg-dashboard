import { getGroup } from '@/actions/groups'
import { getStudents } from '@/actions/students'
import { getUsers } from '@/actions/users'
import { GroupAttendanceTable } from '@/app/dashboard/groups/[id]/_components/group-attendance-table'
import GroupStudentsTable from '@/app/dashboard/groups/[id]/_components/group-students-table'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import AddStudentToGroupButton from './_components/add-student-to-group-button'
import AddTeacherToGroupButton from './_components/add-teacher-to-group-button'
import GroupTeachersTable from './_components/group-teachers-table'
import InfoSection from './_components/info-section'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id
  const group = await getGroup({
    where: { id: Number(id) },
    include: {
      lessons: {
        orderBy: { date: 'asc' },
      },
      location: true,
      course: true,
      teachers: {
        include: {
          teacher: true,
        },
      },
      students: {
        include: {
          student: {
            include: {
              attendances: {
                include: {
                  lesson: true,
                  asMakeupFor: { include: { missedAttendance: { include: { lesson: true } } } },
                  missedMakeup: { include: { makeUpAttendance: { include: { lesson: true } } } },
                },
              },
            },
          },
        },
      },
    },
  })

  if (!group) {
    return <div>Группа не найдена</div>
  }

  const teachers = await getUsers({
    where: {
      groups: {
        none: { teacherId: { in: group.teachers.map((gt) => gt.teacherId) } },
      },
    },
  })

  const students = await getStudents({
    where: {
      groups: {
        none: { studentId: { in: group.students.map((gs) => gs.studentId) } },
      },
    },
  })

  const studentsInGroup = group.students.map((gs) => gs.student)

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        <InfoSection group={group} />
        <Card>
          <CardHeader>
            <CardTitle>Преподаватели</CardTitle>
            <CardAction>
              <AddTeacherToGroupButton group={group} teachers={teachers} />
            </CardAction>
          </CardHeader>
          <CardContent>
            <GroupTeachersTable data={group.teachers} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Посещаемость</CardTitle>
        </CardHeader>
        <CardContent>
          <GroupAttendanceTable lessons={group.lessons} data={studentsInGroup} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Список учеников</CardTitle>
          <CardAction>
            <AddStudentToGroupButton group={group} students={students} />
          </CardAction>
        </CardHeader>
        <CardContent>
          <GroupStudentsTable data={group.students} />
        </CardContent>
      </Card>
    </div>
  )
}
