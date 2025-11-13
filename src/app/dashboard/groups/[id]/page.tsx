import { getGroup } from '@/actions/groups'
import { GroupStudentDialog } from '@/components/group-student-dialog'
import { GroupStudentsTable } from '@/components/group-students-table'
import { GroupaAttendanceTable } from '@/components/tables/group-attendance-table'
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
    where: { groups: { some: { groupId: group.id } } },
    include: {
      groups: true,
      attendances: {
        where: { lesson: { groupId: group.id } },
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
      <GroupStudentDialog students={students} groupId={group.id} />
      <GroupaAttendanceTable data={group} lessons={lessons} students={students} />
      <GroupStudentsTable data={group} lessons={lessons} students={students} />
    </div>
  )
}
