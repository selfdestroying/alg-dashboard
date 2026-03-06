'use client'

import { Order } from '@/prisma/generated/client'
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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { Field, FieldGroup, FieldLabel } from '@/src/components/ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import { Loader, MoreVertical, Pen } from 'lucide-react'
import { useState } from 'react'
import { useChangeOrderStatusMutation } from '../queries'
import { OrderWithProductAndStudent } from '../types'
import { OrderStatusMap } from './orders-table'

interface OrderActionsProps {
  order: OrderWithProductAndStudent
}

export default function OrderActions({ order }: OrderActionsProps) {
  const [open, setOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [status, setStatus] = useState<Order['status']>(order.status)

  const changeStatusMutation = useChangeOrderStatusMutation()

  const handleChangeStatus = () => {
    changeStatusMutation.mutate(
      { id: order.id, newStatus: status },
      {
        onSuccess: () => setEditDialogOpen(false),
      },
    )
  }

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
          <MoreVertical />
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-max">
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => {
                setEditDialogOpen(true)
                setOpen(false)
              }}
            >
              <Pen />
              Сменить статус
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать заказ</DialogTitle>
            <DialogDescription>Обновите информацию о заказе</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel>Статус</FieldLabel>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as Order['status'])}
                itemToStringLabel={(itemValue) => OrderStatusMap[itemValue]}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="PENDING">{OrderStatusMap.PENDING}</SelectItem>
                    <SelectItem value="COMPLETED">{OrderStatusMap.COMPLETED}</SelectItem>
                    <SelectItem value="CANCELLED">{OrderStatusMap.CANCELLED}</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Отмена</DialogClose>
            <Button disabled={changeStatusMutation.isPending} onClick={handleChangeStatus}>
              {changeStatusMutation.isPending && <Loader className="animate-spin" />}
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
