import { getStudentWithAttendance } from '@/actions/students'
import StudentCard from './student-card'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const student = await getStudentWithAttendance(+id)

  if (!student) return <div>Ошибка при получении ученика</div>

  return <StudentCard student={student} />
}
