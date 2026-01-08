import { getGroup } from '@/actions/groups'
import prisma from '@/lib/prisma'
import InfoSection from '../_components/info-section'
import TeachersSection from '../_components/teachers-section'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id
  const group = await getGroup(+id)

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
        <TeachersSection group={group} currentTeachers={group.teachers} />
      </div>
      <div className="mt-6 grid gap-2 md:grid-cols-2">{/* <InfoSection group={group} /> */}</div>
      {/* <GroupStudentDialog
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
      /> */}
    </div>
  )
}
