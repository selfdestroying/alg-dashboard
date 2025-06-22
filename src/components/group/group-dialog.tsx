'use client'

import { Edit, Plus } from 'lucide-react'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { format } from 'date-fns'
import { DeleteDialog } from '../delete-dialog'
import { GroupForm } from './group-form'
import { IGroup } from '@/types/group'
import { ApiResponse } from '@/types/response'
import { api } from '@/lib/api/api-client'
import { toast } from 'sonner'

export default function GroupDialog({ group }: { group?: IGroup }) {
  const handleDelete = (group: IGroup) => {
    const ok = new Promise<ApiResponse<boolean>>((resolve, reject) => {
      api.delete<boolean>(`groups/${group.id}`, {}, 'dashboard/groups').then((r) => {
        if (r.success) {
          resolve(r)
        } else {
          reject(r)
        }
      })
    })
    toast.promise(ok, {
      loading: 'Loding...',
      success: (data) => data.message,
      error: (data) => data.message,
    })
  }
  return (
    <div className="flex items-center justify-end gap-2">
      <Dialog>
        <DialogTrigger asChild>
          {group ? (
            <Button className="cursor-pointer" size={'icon'} variant={'outline'}>
              <Edit />
            </Button>
          ) : (
            <Button size="icon" className="cursor-pointer size-8" variant={'outline'}>
              <Plus />
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Group Dialog</DialogTitle>
          </DialogHeader>
          <DialogDescription>Create or Update groups</DialogDescription>
          <GroupForm
            defaultValues={{
              name: '',
              time: format(new Date(), 'hh:mm'),
              date: new Date(),
            }}
            group={group}
          />
        </DialogContent>
      </Dialog>
      {group && <DeleteDialog handleDelete={() => handleDelete(group)} />}
    </div>
  )
}
