import { removeFromDismissed } from '@/actions/dismissed'
import { addToGroup } from '@/actions/groups'
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Loader2, MoreVertical, Undo } from 'lucide-react'
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

  const handleReturnToGroup = () => {
    startTransition(() => {
      const ok = Promise.all([
        addToGroup({ groupId, studentId }),
        removeFromDismissed({ where: { id: dismissedId } }),
      ])
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
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <MoreVertical />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => {
              setConfirmOpen(true)
              setOpen(false)
            }}
          >
            <Undo />
            Вернуть в группу
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

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmOpen(false)}>Отмена</AlertDialogCancel>
            <Button variant="destructive" onClick={handleReturnToGroup}>
              {isPending ? <Loader2 className="animate-spin" /> : 'Удалить'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
