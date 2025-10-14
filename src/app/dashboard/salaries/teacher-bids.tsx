'use client'
import { updateUser } from '@/actions/users'
import { Input } from '@/components/ui/input'
import { GroupType } from '@prisma/client'
import { debounce } from 'es-toolkit'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

interface UserBidProps {
  user: {
    id: number
    firstName: string
    lastName: string | null
    role: string
    bidForLesson: number
    bidForIndividual: number
  }
}

export default function UserBid({ user }: UserBidProps) {
  const [lessonBid] = useState(user.bidForLesson)
  const [individualBid] = useState(user.bidForIndividual)
  const handleUpdate = useMemo(
    () =>
      debounce((bid: number, type: GroupType) => {
        const ok = updateUser(
          {
            where: {
              id: user.id,
            },
            data: type == 'GROUP' ? { bidForLesson: bid } : { bidForIndividual: bid },
          },
          '/'
        )

        toast.promise(ok, {
          loading: 'Загрузка...',
          success: 'Успешно!',
          error: (e) => e.message,
        })
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
        <span className="text-muted-foreground text-xs">Урок:</span>

        <Input
          type="number"
          defaultValue={lessonBid}
          onChange={(e) => handleUpdate(+e.target.value, 'GROUP')}
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-xs">Индив.:</span>
        <Input
          type="number"
          defaultValue={individualBid}
          onChange={(e) => handleUpdate(+e.target.value, 'INDIVIDUAL')}
        />
      </div>
    </div>
  )
}
