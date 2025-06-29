'use client'

import { Edit, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { Button } from '../ui/button'
import LessonForm from './lesson-form'
import { ILesson } from '@/types/lesson'

export default function LessonDialog({ lesson, groupId }: { lesson?: ILesson; groupId: number }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {lesson ? (
          <Button size={'icon'} className="cursor-pointer" variant={'outline'}>
            <Edit />
          </Button>
        ) : (
          <Button className="cursor-pointer" variant={'outline'}>
            <Plus />
            Добавить занятие
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактирование занятия</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Заполните поля чтобы создать или редактировать занятие
        </DialogDescription>
        <LessonForm groupId={groupId} lesson={lesson} />
      </DialogContent>
    </Dialog>
  )
}
