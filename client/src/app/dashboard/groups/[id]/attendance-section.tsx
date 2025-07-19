import { AllGroupData } from '@/actions/groups'
import { getUser } from '@/actions/users'
import LessonDialog from '@/components/dialogs/lesson-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { format } from 'date-fns'
import Link from 'next/link'
import { redirect } from 'next/navigation'

function isToday(d1: Date, d2: Date) {
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  )
}

export default async function LessonsSection({ group }: { group: AllGroupData }) {
  const user = await getUser()

  if (!user) {
    return redirect('/auth')
  }
  return (
    <Card className="gap-2">
      <CardHeader>
        <div>
          <LessonDialog groupId={group.id} />
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
                {isToday(new Date(), lesson.date) && (
                  <div className="bg-primary/90 size-2 rounded-full" aria-hidden="true"></div>
                )}
                {format(lesson.date.toString(), 'dd.MM')}
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
