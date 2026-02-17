'use client'
import { Prisma } from '@/prisma/generated/client'
import { deleteTeacherLesson, updateTeacherLesson } from '@/src/actions/lessons'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/src/components/ui/alert-dialog'
import { Button } from '@/src/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from '@/src/components/ui/field'
import { Input } from '@/src/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, MoreVertical, Pen, Trash } from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod/v4'

interface UsersActionsProps {
  tl: Prisma.TeacherLessonGetPayload<{
    include: {
      teacher: true
    }
  }>
}

const editGroupTeacherSchema = z.object({
  bid: z
    .number('Не указана ставка')
    .int('Ставка должна быть числом')
    .gte(0, 'Ставка должна быть >= 0'),
})

type EditGroupTeacherSchemaType = z.infer<typeof editGroupTeacherSchema>

export default function LessonTeacherActions({ tl }: UsersActionsProps) {
  const [open, setOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isDeleteDisabled, setIsDeleteDisabled] = useState(false)
  const [deleteCountdown, setDeleteCountdown] = useState(0)

  const form = useForm<EditGroupTeacherSchemaType>({
    resolver: zodResolver(editGroupTeacherSchema),
    defaultValues: {
      bid: tl.bid,
    },
  })

  const handleEdit = (data: EditGroupTeacherSchemaType) => {
    startTransition(() => {
      const { ...payload } = data
      const ok = updateTeacherLesson({
        where: {
          teacherId_lessonId: {
            teacherId: tl.teacherId,
            lessonId: tl.lessonId,
          },
        },
        data: payload,
      })
      toast.promise(ok, {
        loading: 'Загрузка...',
        success: 'Ставка успешно обновлена',
        error: 'Ошибка при обновлении ставки',
        finally: () => {
          setEditDialogOpen(false)
          setOpen(false)
        },
      })
    })
  }

  const handleDelete = () => {
    startTransition(() => {
      const ok = deleteTeacherLesson({
        where: {
          teacherId_lessonId: {
            teacherId: tl.teacherId,
            lessonId: tl.lessonId,
          },
        },
      })
      toast.promise(ok, {
        loading: 'Загрузка...',
        success: 'Учитель успешно удален',
        error: 'Ошибка при удалении учителя',
        finally: () => {
          setDeleteDialogOpen(false)
          setOpen(false)
        },
      })
    })
  }

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined
    if (deleteDialogOpen) {
      intervalId = setInterval(() => {
        setDeleteCountdown((prev) => {
          if (prev <= 1) {
            setIsDeleteDisabled(false)
            if (intervalId) clearInterval(intervalId)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [deleteDialogOpen])

  useEffect(() => {
    form.reset()
  }, [form, editDialogOpen])

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger render={<Button variant="ghost" />}>
          <MoreVertical />
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-max">
          <DropdownMenuItem
            onClick={() => {
              setEditDialogOpen(true)
              setOpen(false)
            }}
          >
            <Pen />
            Редактировать
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              setDeleteCountdown(3)
              setIsDeleteDisabled(true)
              setDeleteDialogOpen(true)
              setOpen(false)
            }}
          >
            <Trash />
            Удалить
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтвердите удаление</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены что хотите удалить <b>{tl.teacher.name}</b> из списка преподавателей?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <Button variant={'secondary'} size={'sm'} onClick={() => setDeleteDialogOpen(false)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending || isDeleteDisabled}
              size={'sm'}
            >
              {isPending ? (
                <Loader2 className="animate-spin" />
              ) : isDeleteDisabled && deleteCountdown > 0 ? (
                `Удалить (${deleteCountdown}с)`
              ) : (
                'Удалить'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать</DialogTitle>
            <DialogDescription>{tl.teacher.name}</DialogDescription>
          </DialogHeader>

          <form id="teacher-group-edit-form" onSubmit={form.handleSubmit(handleEdit)}>
            <FieldGroup className="gap-2">
              <Controller
                name="bid"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldContent>
                      <FieldLabel htmlFor="form-rhf-input-bid">Ставка</FieldLabel>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </FieldContent>
                    <Input
                      id="form-rhf-input-bid"
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </Field>
                )}
              />
            </FieldGroup>
          </form>

          <DialogFooter>
            <DialogClose render={<Button variant="secondary" size={'sm'} />}>Cancel</DialogClose>
            <Button type="submit" size={'sm'} form="teacher-group-edit-form" disabled={isPending}>
              Подтвердить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
