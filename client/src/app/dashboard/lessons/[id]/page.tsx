import { getLesson } from '@/actions/lessons'
import { AttendanceTable } from '@/components/tables/attendance-table'
import { format } from 'date-fns'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id
  const lesson = await getLesson(+id)
  if (!lesson) {
    return <div>Ошибка при получении группы</div>
  }
  return (
    <div className="space-y-2">
      <p>
        {format(lesson.date.toString(), 'dd.MM')} - {lesson.time}
      </p>
      <AttendanceTable attendance={lesson.attendance} />
    </div>
  )
}
