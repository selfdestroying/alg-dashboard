import { getGroup } from '@/actions/groups'
import { GroupStudentDialog } from '@/components/group-student-dialog'
import { GroupaAttendanceTable } from '@/components/tables/group-attendance-table'
import { GroupStudentsTable } from '@/components/tables/group-students-table'
import { Card, CardHeader } from '@/components/ui/card'
import prisma from '@/lib/prisma'
import InfoSection from './info-section'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id
  const group = await getGroup(+id)
  if (!group) {
    return (
      <Card>
        <CardHeader className="justify-center gap-0">Ошибка при получении группы</CardHeader>
      </Card>
    )
  }
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
      <InfoSection group={group} />
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
