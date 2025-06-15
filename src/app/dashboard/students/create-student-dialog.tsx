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
import { UserPlus } from 'lucide-react'
import { useState } from 'react'

export default function CreateStudentDialog() {
  const [open, setOpen] = useState<boolean>(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Create Student
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Enter the student details to add them to the system.
          </DialogDescription>
        </DialogHeader>
        <CreateStudentForm
          callback={() => {
            setOpen(false)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
