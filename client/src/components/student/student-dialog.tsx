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
import { StudentForm } from './student-form'

export default function StudentDialog({ student }: { student?: IStudent }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {student ? (
          <Button className="cursor-pointer" size={'icon'} variant={'outline'}>
            <Edit />
          </Button>
        ) : (
          <Button className="cursor-pointer">
            <UserPlus />
            Создать ученика
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Редактирование ученика</DialogTitle>
          <DialogDescription>
            Заполните поля чтобы создать или редактировать ученика
          </DialogDescription>
        </DialogHeader>
        <StudentForm student={student} defaultValues={{ name: '', age: 6 }} />
      </DialogContent>
    </Dialog>
  )
}
