'use client'

import { cancelPayment } from '@/src/actions/payments'
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
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { Payment } from '@prisma/client'
import { CircleX, Loader2, MoreVertical } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

interface PaymentsActionsProps {
  payment: Payment
}

export default function PaymentsActions({ payment }: PaymentsActionsProps) {
  const [open, setOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(() => {
      const ok = cancelPayment({
        where: { id: payment.id },
      })
      toast.promise(ok, {
        loading: 'Отмена оплаты...',
        success: 'Оплата успешно отменена',
        error: 'Не удалось отменить оплату',
        finally: () => setConfirmOpen(false),
      })
    })
  }

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
          <MoreVertical />
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-max">
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              setConfirmOpen(true)
              setOpen(false)
            }}
          >
            <CircleX className="mr-2 h-4 w-4" />
            Отменить оплату
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены, что хотите отменить оплату?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие отменит оплату и не может быть отменено. Это так же повлияет на баланс
              ученика
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <Button variant="destructive" disabled={isPending} onClick={handleDelete}>
              {isPending ? <Loader2 className="animate-spin" /> : 'Отменить'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
