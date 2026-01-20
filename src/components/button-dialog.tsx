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
import { DoorOpen, LucideProps, Pen, Plus } from 'lucide-react'
import { ForwardRefExoticComponent, RefAttributes, useState } from 'react'
import { Button, buttonVariants } from './ui/button'
import { DialogHeader, DialogTitle } from './ui/dialog'

const IconMap: Record<
  'plus' | 'edit' | 'doorOpen',
  ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>
> = {
  plus: Plus,
  edit: Pen,
  doorOpen: DoorOpen,
}

interface FormDialogProps<T extends object = object> {
  title?: string
  icon?: keyof typeof IconMap
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
  icon,
  FormComponent,
  formComponentProps,
  description,
  triggerButtonProps,
  submitButtonProps,
}: FormDialogProps<T>) {
  const [open, setOpen] = useState(false)
  const Icon = icon ? IconMap[icon] : null
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button {...triggerButtonProps} />}>
        {Icon && <Icon />} {title}
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b px-6 py-4 text-base">{title}</DialogTitle>
        </DialogHeader>
        {description && (
          <DialogDescription className="px-6 py-4 text-base">{description}</DialogDescription>
        )}
        <div className="overflow-y-auto">
          <div className="px-6 pt-4 pb-6">
            <FormComponent {...(formComponentProps as T)} onSubmit={() => setOpen(false)} />
          </div>
        </div>
        <DialogFooter className="border-t px-6 py-4">
          <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
          <Button {...submitButtonProps}>Подтвердить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
