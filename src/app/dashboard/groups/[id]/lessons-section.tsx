import { AllGroupData } from '@/actions/groups'
import { LessonWithCountUnspecified } from '@/actions/lessons'
import FormDialog from '@/components/button-dialog'
import LessonForm from '@/components/forms/lesson-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import Link from 'next/link'

function isToday(d1: Date, d2: Date) {
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  )
}

function getLessonStatus(lesson: LessonWithCountUnspecified) {
  const now = new Date()
  const isTodayLesson = isToday(now, lesson.date)
  const isPastLesson = now > lesson.date

  if (isTodayLesson) {
    return <div className="size-2 rounded-full bg-orange-300" aria-hidden="true" />
  }

  if (isPastLesson) {
    const hasAttendance = lesson._count.attendance > 0
    const className = hasAttendance
      ? 'bg-error size-2 animate-pulse rounded-full'
      : 'bg-success size-2 rounded-full'

    return <div className={className} aria-hidden="true" />
  }

  return null
}

export default async function LessonsSection({ group }: { group: AllGroupData }) {
  return (
    <Card className="gap-2">
      <CardHeader>
        <div>
          <FormDialog
            title="Добавить занятие"
            submitButtonProps={{ form: 'lesson-form' }}
            FormComponent={LessonForm}
            formComponentProps={{ groupId: group.id }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-8">
          {group.lessons.map((lesson) => (
            <Button
              key={lesson.id}
              variant={'outline'}
              className="hover:border-primary/90 flex items-center justify-center gap-2 rounded-lg border p-2 transition-colors"
              asChild
            >
              <Link href={`/dashboard/lessons/${lesson.id}`}>
                {getLessonStatus(lesson)}
                {lesson.date.toLocaleDateString('ru-RU')}
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
