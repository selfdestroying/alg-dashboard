'use client'

import { Button } from '@/components/ui/button'
import {
  DialogHeader,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { Edit, Plus } from 'lucide-react'
import { GroupForm } from './group-form'
import { IGroup } from '@/types/group'
import { format } from 'date-fns'
import { useData } from '../data-provider'

export default function GroupDialog({ group }: { group?: IGroup }) {
  const { courses, teachers } = useData()
  // const [courses, setCourses] = useState<ICourse[]>([])
  // const [teachers, setTeachers] = useState<ITeacher[]>([])

  // const [, startTransition] = useTransition()
  // useEffect(() => {
  //   startTransition(async () => {
  //     // setCourses(await getCourses())
  //     // setTeachers(await getTeachers())
  //   })
  // }, [])

  return (
    <Dialog>
      <DialogTrigger asChild>
        {group ? (
          <Button className="cursor-pointer" variant={'outline'}>
            <Edit className="h-4 w-4" />
          </Button>
        ) : (
          <Button className="cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Group Dialog</DialogTitle>
        </DialogHeader>
        <DialogDescription>Create or Update groups</DialogDescription>
        {courses.length != 0 && (
          <GroupForm
            group={group}
            defaultValues={{
              name: '',
              course: courses[0].id.toString(),
              teacher: teachers[0].id.toString(),
              time: format(new Date(), 'hh:mm'),
              date: new Date(),
            }}
            courses={courses}
            teachers={teachers}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
