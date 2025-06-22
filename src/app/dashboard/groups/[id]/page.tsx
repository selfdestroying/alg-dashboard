import DataTable from '@/components/ui/data-table'
import { columnsInGroup } from '../../students/students'
import { DayOfWeek, IGroup } from '@/types/group'
import StudentGroupDialog from '@/components/student-group-dialog'
import { api } from '@/lib/api/api-client'
import { IStudent } from '@/types/student'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BookOpen,
  Calendar,
  CalendarDays,
  Clock,
  Edit,
  Plus,
  Timer,
  User,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { DeleteDialog } from '@/components/delete-dialog'
import { GroupForm } from '@/components/group/group-form'
import { Button } from '@/components/ui/button'
import { ApiResponse } from '@/types/response'
import { toast } from 'sonner'
import GroupDialog from '@/components/group/group-dialog'

export default async function GroupDetail({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id
  const group = await api.get<IGroup>(`groups/${id}`)

  if (!group.success) {
    return <div>{group.message}</div>
  }
  const studentsExcludeInGroup = await api.get<IStudent[]>(`students?groupId=${id}`)

  return (
    <div className="space-y-4">
      <div className="flex lg:flex-row flex-col gap-4">
        <Card className="flex-1/2 gap-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Group Information
                </CardTitle>
                <CardDescription>Detailed information about the selected group</CardDescription>
              </div>
              <GroupDialog group={group.data} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <BookOpen className="h-4 w-4" />
                  Group Name
                </div>
                <p className="font-semibold">{group.data.name}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <BookOpen className="h-4 w-4" />
                  Course
                </div>
                <p className="font-semibold">{group.data.course}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <User className="h-4 w-4" />
                  Teacher
                </div>
                <p className="font-semibold">{group.data.teacher}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium ">
                  <CalendarDays className="h-4 w-4" />
                  Lesson Day
                </div>
                <p className="font-semibold">{DayOfWeek[group.data.lessonDay]}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium ">
                  <Timer className="h-4 w-4" />
                  Lesson Time
                </div>
                <p className="font-semibold">{group.data.lessonTime}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4" />
                  Start Date
                </div>
                <p className="font-semibold">
                  {new Date(group.data.startDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1/2 gap-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Students
                </CardTitle>
                <CardDescription>Students enrolled in {group.data.name}</CardDescription>
              </div>
              {studentsExcludeInGroup.success && (
                <StudentGroupDialog students={studentsExcludeInGroup.data} groupId={id} />
              )}
            </div>
          </CardHeader>
          <CardContent>
            {studentsExcludeInGroup.success ? (
              <DataTable columns={columnsInGroup} data={group.data.students} addButton={<></>} />
            ) : (
              <div>Error</div>
            )}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule
          </CardTitle>
          <CardDescription>Upcoming classes for {group.data.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {group.data.lessons.map((l) => (
              <div key={l.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 font-semibold">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(l.date), 'dd-MM-yyyy')}
                      </span>
                      <Badge variant={'secondary'} className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {l.time.slice(0, l.time.length - 3)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {l.attendances.map((a) => (
                      <div key={a.student} className="flex items-center space-x-2">
                        <Checkbox id={`${l.id}-${a.student}`} defaultChecked={a.wasPresent} />
                        <label
                          htmlFor={`${l.id}-${a.student}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {a.student}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
