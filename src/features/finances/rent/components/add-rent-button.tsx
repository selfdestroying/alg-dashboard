'use client'

import { Button } from '@/src/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/components/ui/dialog'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader, Plus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRentCreateMutation } from '../queries'
import { CreateRentSchema, type CreateRentSchemaType } from '../schemas'
import RentForm from './rent-form'

export default function AddRentButton() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const createMutation = useRentCreateMutation()

  const form = useForm<CreateRentSchemaType>({
    resolver: zodResolver(CreateRentSchema),
    defaultValues: {
      locationId: undefined,
      startDate: undefined,
      endDate: undefined,
      amount: undefined,
      comment: undefined,
    },
  })

  const onSubmit = (values: CreateRentSchemaType) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        form.reset()
        setDialogOpen(false)
      },
    })
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger render={<Button size={'icon'} />}>
        <Plus />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить аренду</DialogTitle>
          <DialogDescription>Укажите локацию, период и сумму расхода</DialogDescription>
        </DialogHeader>
        <RentForm form={form} formId="create-rent-form" />
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Отмена</DialogClose>
          <Button
            type="button"
            disabled={createMutation.isPending}
            onClick={form.handleSubmit(onSubmit)}
          >
            {createMutation.isPending && <Loader className="animate-spin" />}
            Создать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
