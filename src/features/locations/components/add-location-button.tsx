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
import { useLocationCreateMutation } from '../queries'
import { CreateLocationSchema, CreateLocationSchemaType } from '../schemas'
import LocationForm from './location-form'

export default function AddLocationButton() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const createMutation = useLocationCreateMutation()

  const form = useForm<CreateLocationSchemaType>({
    resolver: zodResolver(CreateLocationSchema),
    defaultValues: {
      name: undefined,
    },
  })

  const onSubmit = (values: CreateLocationSchemaType) => {
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
          <DialogTitle>Добавить локацию</DialogTitle>
          <DialogDescription>Создайте новую локацию</DialogDescription>
        </DialogHeader>
        <LocationForm form={form} formId="create-location-form" />
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
