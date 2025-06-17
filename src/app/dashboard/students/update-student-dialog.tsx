'use client'

import { CreateStudentForm } from '@/components/create-student-form'
import { Button } from '@/components/ui/button'
import {
  DialogHeader,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { UpdateStudentForm } from '@/components/update-student-form'
import { IStudent } from '@/types/student'
import { Edit } from 'lucide-react'
import { useState } from 'react'

export default function UpdateStudentDialog({ student }: { student: IStudent }) {
  const [open, setOpen] = useState<boolean>(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer" variant={'outline'}>
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Enter the student details to add them to the system.
          </DialogDescription>
        </DialogHeader>
        <UpdateStudentForm
          callback={() => {
            setOpen(false)
          }}
          student={student}
        />
      </DialogContent>
    </Dialog>
  )
}
