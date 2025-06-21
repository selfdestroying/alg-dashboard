import DataTable from '@/components/ui/data-table'
import { columnsInGroup } from '../../students/students'
import { DayOfWeek, IGroup } from '@/types/group'
import { Badge } from '@/components/ui/badge'
import StudentGroupDialog from '@/components/student-group-dialog'
import { api } from '@/lib/api/api-client'
import { IStudent } from '@/types/student'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Checkbox } from '@/components/ui/checkbox'

export default async function GroupDetail({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id
  const group = await api.get<IGroup>(`groups/${id}`)

  if (!group.success) {
    return <div>{group.message}</div>
  }
  const studentsExcludeInGroup = await api.get<IStudent[]>(`students?groupId=${id}`)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-x-4 space-y-4">
          <h1 className="text-3xl font-bold">{group.data.name}</h1>
          <Badge variant={'secondary'}>{group.data.course}</Badge>
          <Badge variant={'secondary'}>{group.data.teacher}</Badge>
          <Badge variant={'secondary'}>{DayOfWeek[group.data.lessonDay]}</Badge>
          <Badge variant={'secondary'}>{group.data.lessonTime}</Badge>
          <Badge variant={'secondary'}>{group.data.startDate}</Badge>
        </div>
      </div>

      {studentsExcludeInGroup.success ? (
        <DataTable
          columns={columnsInGroup}
          data={group.data.students}
          addButton={<StudentGroupDialog students={studentsExcludeInGroup.data} groupId={id} />}
        />
      ) : (
        <div>Error</div>
      )}

      <div className="flex justify-between items-center">
        <div className="space-x-4 space-y-4 w-full">
          <h1 className="text-3xl font-bold">Lessons</h1>
          <Accordion type="single" collapsible>
            {group.data.lessons.map((l) => (
              <AccordionItem value={l.id.toString()} key={l.id} className="w-full">
                <AccordionTrigger>
                  {l.date} - {l.time}
                </AccordionTrigger>
                <AccordionContent>
                  {l.attendances.map((a) => (
                    <div key={a.student} className="flex">
                      <Checkbox defaultChecked={a.wasPresent} />
                      <p>{a.student}</p>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  )
}
