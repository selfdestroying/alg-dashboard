'use client'
import { Prisma } from '@/prisma/generated/client'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Skeleton } from '@/src/components/ui/skeleton'
import { useMemberListQuery } from '@/src/data/member/member-list-query'
import { useMemberRemoveMutation } from '@/src/data/member/member-remove-mutation'
import { useUserSetPasswordMutation } from '@/src/data/user/user-set-password-mutatin'
import { Check, Loader } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface ListMembersProps {
  members: Prisma.MemberGetPayload<{
    include: { user: true }
  }>[]
  organizationId: number
}

export default function ListMembers({ organizationId }: ListMembersProps) {
  const [newPassword, setNewPassword] = useState<string | undefined>()
  const { data: members, isLoading: isMembersLoading } = useMemberListQuery(organizationId)
  const { mutate } = useMemberRemoveMutation(organizationId)
  const userSetPasswordMutation = useUserSetPasswordMutation()

  if (isMembersLoading) {
    return <Skeleton className="h-full w-full" />
  }

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-4">
      {members?.map((member) => (
        <div key={member.id} className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">{member.user.name}</h2>
              <p className="text-muted-foreground text-sm">{member.user.email}</p>
              <p className="text-muted-foreground text-xs">Role: {member.role}</p>
              <div className="flex gap-2">
                <Input
                  value={newPassword ?? ''}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={userSetPasswordMutation.isPending}
                />
                <Button
                  size={'icon'}
                  onClick={() =>
                    newPassword &&
                    userSetPasswordMutation.mutate(
                      {
                        userId: member.user.id,
                        newPassword,
                      },
                      {
                        onSuccess: () => {
                          toast.success('Пароль успешно обновлен')
                          setNewPassword(undefined)
                        },
                        onError: (e) => {
                          toast.error(e.message)
                          setNewPassword(undefined)
                        },
                      }
                    )
                  }
                  disabled={userSetPasswordMutation.isPending}
                >
                  {userSetPasswordMutation.isPending ? (
                    <Loader className="animate-spin" />
                  ) : (
                    <Check />
                  )}
                </Button>
              </div>
            </div>
            {member.role !== 'owner' && (
              <Button
                variant={'destructive'}
                onClick={() => {
                  mutate(member.id.toString())
                }}
              >
                Remove
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
