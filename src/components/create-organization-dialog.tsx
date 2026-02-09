'use client'

import { Dialog, DialogDescription, DialogTitle, DialogTrigger } from '@/src/components/ui/dialog'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'

import { CreateOrganizationForm } from './create-organization-form'
import { Button } from './ui/button'
import { DialogContent, DialogHeader } from './ui/dialog'

export default function CreateOrganizationDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" className="w-full gap-2" variant="default" />}>
        <PlusIcon />
        <p>New Organization</p>
      </DialogTrigger>
      <DialogContent className="w-11/12 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Organization</DialogTitle>
          <DialogDescription>
            Create a new organization to collaborate with your team.
          </DialogDescription>
        </DialogHeader>
        <CreateOrganizationForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
