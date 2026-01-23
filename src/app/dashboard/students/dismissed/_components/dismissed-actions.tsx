import { removeDismissed, returnToGroup } from '@/actions/dismissed'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, MoreVertical, Trash2, Undo } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

interface DismissedActionsProps {
  dismissedId: number
  studentName: string
  studentId: number
  groupId: number
}

export default function DismissedActions({
  dismissedId,
  studentName,
  studentId,
  groupId,
}: DismissedActionsProps) {
  const [open, setOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [confirmText, setConfirmText] = useState('')

  const handleReturnToGroup = () => {
    startTransition(() => {
      const ok = returnToGroup({ dismissedId, groupId, studentId })
      toast.promise(ok, {
        loading: 'Загрузка...',
        success: 'Ученик успешно возвращен в группу',
        error: (e) => e.message,
      })
      setConfirmOpen(false)
      setOpen(false)
    })
  }

  const handleDelete = () => {
    startTransition(() => {
      const ok = removeDismissed({ where: { id: dismissedId } })
      toast.promise(ok, {
        loading: 'Загрузка...',
        success: 'Ученик успешно удален',
        error: (e) => e.message,
      })
      setConfirmOpen(false)
      setOpen(false)
    })
  }

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
          <MoreVertical />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleReturnToGroup}>
            <Undo />
            Вернуть в группу
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              setConfirmOpen(true)
              setOpen(false)
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Удалить
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Вы уверены, что хотите удалить <strong>{studentName}</strong>?
            </AlertDialogTitle>
            <AlertDialogDescription>
              При удалении записи, будут удалены все связанные с ним сущности. Это действие нельзя
              будет отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="">
            <Label htmlFor="confirm">Введите для подтверждения удаления:</Label>
            <Input
              id="confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={studentName}
              className="mt-2"
              autoFocus
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmOpen(false)}>Отмена</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={confirmText !== studentName || isPending}
            >
              {isPending ? <Loader2 className="animate-spin" /> : 'Удалить'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
