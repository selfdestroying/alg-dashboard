'use client'

import { Button } from '@/components/ui/button'
import {
  DialogHeader,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { IStudent } from '@/types/student'
import { UserPlus } from 'lucide-react'
import { useState } from 'react'
import { StudentGroupForm } from './student-group-form'

export default function StudentGroupDialog({
  students,
  groupId,
}: {
  students: IStudent[]
  groupId: string
}) {
  const [open, setOpen] = useState<boolean>(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer" variant={'outline'}>
          <UserPlus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Student Dialog</DialogTitle>
          <DialogDescription>Create or update students</DialogDescription>
        </DialogHeader>
        <StudentGroupForm students={students} groupId={groupId} />
      </DialogContent>
    </Dialog>
  )
}
