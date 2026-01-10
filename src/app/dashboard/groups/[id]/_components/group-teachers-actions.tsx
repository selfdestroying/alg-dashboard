'use client'
import { deleteTeacherGroup, updateTeacherGroup } from '@/actions/groups'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Prisma } from '@prisma/client'
import { Loader2, MoreVertical, Pen, Trash } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

interface UsersActionsProps {
  tg: Prisma.TeacherGroupGetPayload<{
    include: {
      teacher: true
    }
  }>
}

export default function GroupTeacherActions({ tg }: UsersActionsProps) {
  const [open, setOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isApplyToLessons, setIsApplyToLessons] = useState(false)
  const [bid, setBid] = useState<number>(tg.bid)

  const handleEdit = () => {
    startTransition(() => {
      console.log(isApplyToLessons)
      const ok = updateTeacherGroup(
        {
          where: {
            teacherId_groupId: {
              teacherId: tg.teacherId,
              groupId: tg.groupId,
            },
          },
          data: {
            bid,
          },
        },
        isApplyToLessons
      )
      toast.promise(ok, {
        loading: 'Загрузка...',
        success: 'Ставка успешно обновлена',
        error: 'Ошибка при обновлении ставки',
        finally: () => {
          setEditDialogOpen(false)
          setOpen(false)
          setIsApplyToLessons(false)
        },
      })
    })
  }

  const handleDelete = () => {
    startTransition(() => {
      const ok = deleteTeacherGroup(
        {
          where: {
            teacherId_groupId: {
              teacherId: tg.teacherId,
              groupId: tg.groupId,
            },
          },
        },
        isApplyToLessons
      )
      toast.promise(ok, {
        loading: 'Загрузка...',
        success: 'Учитель успешно удален',
        error: 'Ошибка при удалении учителя',
        finally: () => {
          setDeleteDialogOpen(false)
          setOpen(false)
          setIsApplyToLessons(false)
        },
      })
    })
  }

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <MoreVertical />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
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
            <AlertDialogTitle>
              Вы уверены, что хотите удалить{' '}
              <strong>
                {tg.teacher.firstName} {tg.teacher.lastName || ''}
              </strong>
              ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              При удалении записи, будут удалены все связанные с ним сущности. Это действие нельзя
              будет отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Label className="hover:bg-accent/50 flex items-start gap-2 rounded-lg border p-2 has-[[aria-checked=true]]:border-violet-600 has-[[aria-checked=true]]:bg-violet-50 dark:has-[[aria-checked=true]]:border-violet-900 dark:has-[[aria-checked=true]]:bg-violet-950">
            <Checkbox
              defaultChecked={isApplyToLessons}
              onCheckedChange={(checked) => setIsApplyToLessons(Boolean(checked))}
              className="data-[state=checked]:border-violet-600 data-[state=checked]:bg-violet-600 data-[state=checked]:text-white dark:data-[state=checked]:border-violet-700 dark:data-[state=checked]:bg-violet-700"
            />
            <div className="grid gap-2 font-normal">
              <p className="text-sm leading-none font-medium">Применить к урокам</p>
            </div>
          </Label>

          <AlertDialogFooter>
            <Button variant={'secondary'} size={'sm'} onClick={() => setDeleteDialogOpen(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending} size={'sm'}>
              {isPending ? <Loader2 className="animate-spin" /> : 'Удалить'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="flex flex-col overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
          <DialogHeader className="contents space-y-0 text-left">
            <DialogTitle className="border-b px-6 py-4 text-base">Редактировать</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto">
            <div className="space-y-2 px-6">
              <div className="grid w-full items-center gap-3">
                <Label htmlFor="email">Ставка</Label>
                <Input
                  type="number"
                  id="bid"
                  defaultValue={bid}
                  onChange={(e) => setBid(Number(e.target.value))}
                />
              </div>
              <Label className="hover:bg-accent/50 flex items-start gap-2 rounded-lg border p-2 has-[[aria-checked=true]]:border-violet-600 has-[[aria-checked=true]]:bg-violet-50 dark:has-[[aria-checked=true]]:border-violet-900 dark:has-[[aria-checked=true]]:bg-violet-950">
                <Checkbox
                  defaultChecked={isApplyToLessons}
                  onCheckedChange={(checked) => setIsApplyToLessons(Boolean(checked))}
                  className="data-[state=checked]:border-violet-600 data-[state=checked]:bg-violet-600 data-[state=checked]:text-white dark:data-[state=checked]:border-violet-700 dark:data-[state=checked]:bg-violet-700"
                />
                <div className="grid gap-2 font-normal">
                  <p className="text-sm leading-none font-medium">Применить к урокам</p>
                </div>
              </Label>
            </div>
          </div>
          <DialogFooter className="border-t px-6 py-4">
            <DialogClose asChild>
              <Button variant="secondary" size={'sm'}>
                Cancel
              </Button>
            </DialogClose>
            <Button size={'sm'} onClick={handleEdit} disabled={isPending}>
              Подтвердить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
