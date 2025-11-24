import { getGroups } from '@/actions/groups'
import { getStudent } from '@/actions/students'
import StudentCard from './student-card'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const student = await getStudent(+id)

  if (!student) return <div>Ошибка при получении ученика</div>

  return <StudentCard student={student} />
}
