import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Trash } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog'
import { Input } from './ui/input'

interface RowActionsProps {
  id: number
  confirmationText: string
  action: (id: number) => Promise<void>
}

export default function DeleteAction({ id, action, confirmationText }: RowActionsProps) {
  const [isUpdatePending, startUpdateTransition] = useTransition()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [studentName, setStudentName] = useState('')

  const handleDelete = () => {
    startUpdateTransition(() => {
      const ok = action(id)
      toast.promise(ok, {
        loading: 'Загрузка...',
        success: 'Ученик успешно удален',
        error: (e) => e.message,
      })
    })
  }

  return (
    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size={'icon'}>
          <Trash className="stroke-error" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Вы уверены, что хотите удалить <strong>{confirmationText}</strong>?
          </AlertDialogTitle>
          <AlertDialogDescription>
            При удалении записи, будут удалены все связанные с ним сущности. Это действие нельзя
            будет отменить.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
          <Label className="text-muted-foreground text-sm font-medium">
            Введите для подтверждения удаления:
          </Label>
          <Input
            placeholder={confirmationText}
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isUpdatePending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isUpdatePending || studentName !== confirmationText}
            className="bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-white shadow-xs"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
