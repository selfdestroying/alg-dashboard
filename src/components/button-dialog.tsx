'use client'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { VariantProps } from 'class-variance-authority'
import { LucideProps } from 'lucide-react'
import { ForwardRefExoticComponent, RefAttributes, useState } from 'react'
import { Button, buttonVariants } from './ui/button'
import { DialogHeader, DialogTitle } from './ui/dialog'

interface FormDialogProps<T extends object = object> {
  title: string
  icon?: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>
  description?: string
  FormComponent: React.ComponentType<T & { onSubmit: () => void }>
  formComponentProps?: T
  triggerButtonProps?: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }
  submitButtonProps?: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }
}

export default function FormDialog<T extends object = object>({
  title,
  icon: Icon,
  FormComponent,
  formComponentProps,
  description,
  triggerButtonProps,
  submitButtonProps,
}: FormDialogProps<T>) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button {...triggerButtonProps}>{Icon ? <Icon /> : title}</Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b px-6 py-4 text-base">{title}</DialogTitle>
        </DialogHeader>
        <DialogDescription className={description && 'px-6 py-4 text-base'}>
          {description}
        </DialogDescription>
        <div className="overflow-y-auto">
          <div className="px-6 pt-4 pb-6">
            <FormComponent {...(formComponentProps as T)} onSubmit={() => setOpen(false)} />
          </div>
        </div>
        <DialogFooter className="border-t px-6 py-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button {...submitButtonProps}>Подтвердить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
