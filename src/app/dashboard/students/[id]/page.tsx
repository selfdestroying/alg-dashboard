import { getGroups } from '@/actions/groups'
import { getStudent } from '@/actions/students'
import StudentCard from './student-card'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const student = await getStudent(+id)
  const groups = await getGroups()

  if (!student) return <div>Ошибка при получении ученика</div>

  return <StudentCard student={student} groups={groups} />
}
