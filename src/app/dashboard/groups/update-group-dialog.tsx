'use client'

import getCourses from '@/actions/courses'
import { CreateGroupForm } from '@/components/create-group-form'
import { Button } from '@/components/ui/button'
import {
  DialogHeader,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { UpdateGroupForm } from '@/components/update-group-form'
import { ICourse } from '@/types/course'
import { IGroups } from '@/types/group'
import { Plus } from 'lucide-react'
import { useState } from 'react'

export default function UpdateGroupDialog({ group }: { group: IGroups }) {
  const [open, setOpen] = useState<boolean>(false)
  const [courses, setCourses] = useState<ICourse[]>([])
  const handleDialogOpen = async () => {
    const courses = await getCourses()
    if (!courses) {
      return
    }
    setCourses(courses)
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer" onClick={handleDialogOpen}>
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
        </DialogHeader>
        <UpdateGroupForm
          callback={() => {
            setOpen(false)
          }}
          courses={courses}
          group={group}
        />
      </DialogContent>
    </Dialog>
  )
}
