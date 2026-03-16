'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/components/ui/dialog'
import { Skeleton } from '@/src/components/ui/skeleton'
import { useSessionQuery } from '@/src/data/user/session-query'
import { useSessionRevokeMutation } from '@/src/data/user/session-revoke-mutation'
import { Laptop, Loader, Smartphone } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { UAParser } from 'ua-parser-js'
import { useActiveSessionsQuery } from '../queries'
import { ChangePasswordForm } from './change-password-form'

export default function UserCard() {
  const router = useRouter()
  const revokeSessionMutation = useSessionRevokeMutation()
  const { data: session, isLoading: isSessionLoading } = useSessionQuery()
  const { data: activeSessions = [], isLoading: isSessionsLoading } = useActiveSessionsQuery()

  if (isSessionLoading || isSessionsLoading) return <Skeleton className="h-48 w-full" />

  return (
    <Card>
      <CardContent className="grid grid-cols-1 gap-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="hidden h-9 w-9 sm:flex">
                <AvatarImage
                  src={session?.user.image || undefined}
                  alt="Avatar"
                  className="object-cover"
                />
                <AvatarFallback>{session?.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="grid">
                <div className="flex items-center gap-1">
                  <p className="text-sm leading-none font-medium">{session?.user.name}</p>
                </div>
                <p className="text-sm">{session?.user.email}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex w-max flex-col gap-1 border-l-2 px-2">
          <p className="text-xs font-medium">Активные сессии</p>
          {activeSessions
            .filter((s) => s.userAgent)
            .map((s) => {
              const isCurrentSession = s.id === session?.session.id
              const isTerminating =
                revokeSessionMutation.isPending &&
                revokeSessionMutation.variables?.token === s.token

              return (
                <div key={s.id}>
                  <div className="flex items-center gap-2 text-sm font-medium text-black dark:text-white">
                    {new UAParser(s.userAgent || '').getDevice().type === 'mobile' ? (
                      <Smartphone />
                    ) : (
                      <Laptop size={16} />
                    )}
                    {new UAParser(s.userAgent || '').getOS().name || s.userAgent},{' '}
                    {new UAParser(s.userAgent || '').getBrowser().name}
                    <Button
                      variant={'destructive'}
                      onClick={() => {
                        revokeSessionMutation.mutate(
                          { token: s.token },
                          {
                            onSuccess: () => {
                              if (isCurrentSession) {
                                router.push('/')
                              }
                            },
                          },
                        )
                      }}
                    >
                      {isTerminating ? (
                        <Loader size={15} className="animate-spin" />
                      ) : isCurrentSession ? (
                        'Выйти'
                      ) : (
                        'Завершить'
                      )}
                    </Button>
                  </div>
                </div>
              )
            })}
        </div>
        <div>
          <ChangePassword />
        </div>
      </CardContent>
    </Card>
  )
}

function ChangePassword() {
  const [open, setOpen] = useState<boolean>(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant={'outline'} />}>Сменить пароль</DialogTrigger>
      <DialogContent className="w-11/12 sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Сменить пароль</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <ChangePasswordForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
