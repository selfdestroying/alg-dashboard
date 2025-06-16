'use client'

import { CreateGroupForm } from '@/components/create-group-form'
import { Button } from '@/components/ui/button'
import {
  DialogHeader,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ICourse } from '@/types/course'
import { Plus } from 'lucide-react'
import { useState } from 'react'

export default function CreateGroupDialog({ courses }: { courses: ICourse[] }) {
  const [open, setOpen] = useState<boolean>(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer">
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
        </DialogHeader>
        <CreateGroupForm
          callback={() => {
            setOpen(false)
          }}
          courses={courses}
        />
      </DialogContent>
    </Dialog>
  )
}
