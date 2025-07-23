import { getLessons } from "@/actions/lessons"
import { format } from "date-fns"

export default async function Page() {
    const lessons = await getLessons()

    return lessons.map(lesson => <div key={lesson.id}>{format(lesson.date, 'dd/MM/yyyy')} - {lesson.group.name} - {lesson.group.teacher.firstName} - Количество учеников: {lesson.attendance.length} - Пропустившие: {lesson.attendance.filter(a => a.status == 'ABSENT').length} - Не отмеченные: {lesson.attendance.filter(a => a.status == 'UNSPECIFIED').length}</div>)
}