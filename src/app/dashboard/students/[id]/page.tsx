import { getStudent } from '@/actions/students'
import StudentCard from './_components/student-card'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const student = await getStudent({
    where: { id: Number(id) },
    include: {
      groups: {
        include: {
          group: {
            include: {
              lessons: {
                orderBy: { date: 'asc' },
              },
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

  return <StudentCard student={student} />
}
