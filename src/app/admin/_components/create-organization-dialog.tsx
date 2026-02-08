'use client'
import { CreateOrganizationForm } from '@/src/components/create-organization-form'
import { Button } from '@/src/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/components/ui/dialog'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'

export default function CreateOrganizationDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="default" />}>
        <PlusIcon />
        <p>New Organization</p>
      </DialogTrigger>
      <DialogContent>
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
