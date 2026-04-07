'use client'

import { Lesson } from '@/prisma/generated/client'
import { cancelLesson, updateLesson } from '@/src/actions/lessons'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/src/components/ui/alert-dialog'
import { Button } from '@/src/components/ui/button'
import { useTransition } from 'react'
import { toast } from 'sonner'

interface CancelLessonDialogProps {
  lesson: Lesson
  isOpen: boolean
  onClose: () => void
}

export function CancelLessonDialog({ lesson, isOpen, onClose }: CancelLessonDialogProps) {
  const [isPending, startTransition] = useTransition()

  const handleCancel = () => {
    startTransition(() => {
      const ok = cancelLesson({ lessonId: lesson.id })
      toast.promise(ok, {
        loading: 'Отмена урока...',
        success: 'Урок отменён.',
        error: (e) => e.message || 'Ошибка при отмене урока.',
        finally: () => onClose(),
      })
    })
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Отмена урока</AlertDialogTitle>
          <AlertDialogDescription>
            После отмены урока редактирование посещаемости будет заблокировано. Текущая посещаемость
            сохранится.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Назад</AlertDialogCancel>
          <Button variant="destructive" onClick={handleCancel} disabled={isPending}>
            Отменить урок
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

interface RestoreLessonDialogProps {
  lesson: Lesson
  isOpen: boolean
  onClose: () => void
}

export function RestoreLessonDialog({ lesson, isOpen, onClose }: RestoreLessonDialogProps) {
  const [isPending, startTransition] = useTransition()

  const handleRestore = () => {
    startTransition(() => {
      const ok = updateLesson({
        where: { id: lesson.id },
        data: { status: 'ACTIVE' },
      })
      toast.promise(ok, {
        loading: 'Восстановление урока...',
        success: 'Урок восстановлен.',
        error: 'Ошибка при восстановлении урока.',
        finally: () => onClose(),
      })
    })
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Восстановление урока</AlertDialogTitle>
          <AlertDialogDescription>
            Урок будет возвращён в активный статус. Посещаемость станет доступна для редактирования.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Отмена</AlertDialogCancel>
          <Button onClick={handleRestore} disabled={isPending}>
            Восстановить
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
