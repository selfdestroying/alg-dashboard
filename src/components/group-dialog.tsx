'use client'

import { getCourses } from '@/actions/courses'
import { GroupForm } from '@/components/group-form'
import { Button } from '@/components/ui/button'
import {
  DialogHeader,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { ICourse } from '@/types/course'
import { IGroups } from '@/types/group'
import { Edit, Plus } from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'

export default function GroupDialog({ group }: { group?: IGroups }) {
  const [courses, setCourses] = useState<ICourse[]>([])
  const [, startTransition] = useTransition()
  useEffect(() => {
    startTransition(async () => {
      const res = await getCourses()
      setCourses(res)
    })
  }, [])

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
            defaultValues={{ name: '', course: courses[0].id.toString() }}
            courses={courses}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
