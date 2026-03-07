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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import {
  useDismissedDeleteMutation,
  useDismissedReturnMutation,
} from '@/src/features/students/dismissed/queries'
import { Loader2, MoreVertical, Trash2, Undo } from 'lucide-react'
import { useState } from 'react'

interface DismissedActionsProps {
  studentName: string
  studentId: number
  groupId: number
}

export default function DismissedActions({
  studentName,
  studentId,
  groupId,
}: DismissedActionsProps) {
  const [open, setOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const deleteMutation = useDismissedDeleteMutation()
  const returnMutation = useDismissedReturnMutation()

  const isPending = deleteMutation.isPending || returnMutation.isPending

  const handleReturnToGroup = () => {
    returnMutation.mutate(
      { groupId, studentId },
      {
        onSettled: () => {
          setConfirmOpen(false)
          setOpen(false)
        },
      },
    )
  }

  const handleDelete = () => {
    deleteMutation.mutate(
      { studentId, groupId },
      {
        onSettled: () => {
          setConfirmOpen(false)
          setOpen(false)
        },
      },
    )
  }

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
          <MoreVertical />
        </DropdownMenuTrigger>

        <DropdownMenuContent className={'w-max'}>
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
            <Trash2 />
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
