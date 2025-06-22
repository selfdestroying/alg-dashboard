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
import { Edit, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { StudentForm } from './student-form'

export default function StudentDialog({ student }: { student?: IStudent }) {
  const [open, setOpen] = useState<boolean>(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {student ? (
          <Button className="cursor-pointer" size={'icon'} variant={'outline'}>
            <Edit />
          </Button>
        ) : (
          <Button className="cursor-pointer">
            <UserPlus />
            Create Student
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Student Dialog</DialogTitle>
          <DialogDescription>Create or update students</DialogDescription>
        </DialogHeader>
        <StudentForm student={student} defaultValues={{ name: '', age: 6 }} />
      </DialogContent>
    </Dialog>
  )
}
