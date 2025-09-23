import { getLesson } from '@/actions/lessons'
import { AttendanceTable } from '@/components/tables/attendance-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, Calendar, Clock, User } from 'lucide-react'
import Link from 'next/link'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id
  const lesson = await getLesson(+id)
  if (!lesson) {
    return <div>Ошибка при получении урока</div>
  }
  return (
    <div className="space-y-2">
      <Card className="flex flex-col rounded-lg border has-data-[slot=month-view]:flex-1">
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
            <div className="space-y-1">
              <div className="text-muted-foreground/60 flex items-center gap-1 text-xs font-medium tracking-wide uppercase">
                <BookOpen className="h-3 w-3" />
                Группа
              </div>
              <Button asChild variant={'link'} className="h-fit p-0 font-medium">
                <Link href={`/dashboard/groups/${lesson.group.id}`}>{lesson.group.name}</Link>
              </Button>
            </div>

            <div className="space-y-1">
              <div className="text-muted-foreground/60 flex items-center gap-1 text-xs font-medium tracking-wide uppercase">
                <Clock className="h-3 w-3" />
                Время
              </div>
              <p className="text-sm font-semibold">{lesson.time}</p>
            </div>

            {/* Course */}
            <div className="space-y-1">
              <div className="text-muted-foreground/60 flex items-center gap-1 text-xs font-medium tracking-wide uppercase">
                <Calendar className="h-3 w-3" />
                Дата
              </div>
              <p className="text-sm font-semibold">{lesson.date.toLocaleDateString('ru-RU')}</p>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground/60 flex items-center gap-1 text-xs font-medium tracking-wide uppercase">
                <User className="h-3 w-3" />
                Учеников в группе
              </div>
              <p className="text-sm font-semibold">{lesson.group._count.students}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <AttendanceTable attendance={lesson.attendance} />
    </div>
  )
}
