import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { IGroup } from '@/types/group'
import { Calendar } from 'lucide-react'
import { format } from 'date-fns'
import LessonDialog from '@/components/dialogs/lesson-dialog'
import Attendances from '@/components/attendances'
import { getUser } from '@/actions/auth'
import { redirect } from 'next/navigation'

export default async function AttendanceSection({ group }: { group: IGroup }) {
  const user = await getUser()
  if (!user) {
    return redirect('/auth')
  }
  return (
    <Card className="gap-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Расписание
          </CardTitle>
          <LessonDialog groupId={group.id} />
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="space-y-2">
          {group.lessons.map((l) => (
            <AccordionItem key={l.id} value={l.id.toString()} className="border-0">
              <Card className="gap-2 p-0">
                <AccordionTrigger className="cursor-pointer py-2 px-4">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="m-0">{format(l.date, 'dd.MM')}</CardTitle>
                    <Badge variant={'secondary'}>{l.time.slice(0, l.time.length - 3)}</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-0">
                  <CardContent className="space-y-3 p-4">
                    <Attendances lesson={l} user={user} />
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}
