'use client'
import { updateTeacherGroupBid } from '@/actions/groups'
import { UserData } from '@/actions/users'
import { Input } from '@/components/ui/input'
import { Group } from '@prisma/client'
import { debounce } from 'es-toolkit'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

interface UserBidProps {
  user: UserData
  group: Group
  bidForLesson: number | null
}

export default function TeacherGroupBids({ user, group, bidForLesson }: UserBidProps) {
  const [lessonBid] = useState<number | null>(bidForLesson)
  const handleUpdate = useMemo(
    () =>
      debounce((bid: number) => {
        const ok = updateTeacherGroupBid(bid, user.id, group.id)

        toast.promise(ok, {
          loading: 'Загрузка...',
          success: 'Успешно!',
          error: (e) => e.message,
        })
        console.log('save')
      }, 500),
    []
  )

  return (
    <div className="hover:bg-muted/50 flex items-center gap-3 rounded-md border p-2 text-sm transition">
      <div className="flex min-w-[160px] flex-col">
        <span className="font-medium">
          {user.firstName} {user.lastName}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-xs">Ставка:</span>

        <Input
          type="number"
          defaultValue={lessonBid ?? undefined}
          onChange={(e) => handleUpdate(+e.target.value)}
        />
      </div>
    </div>
  )
}
