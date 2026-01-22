'use client'

import { changePassword } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserDTO } from '@/types/user'
import { Loader2, Lock } from 'lucide-react'
import { useActionState, useState } from 'react'

export function ChangePasswordCard({ user }: { user: UserDTO }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [state, action, isPending] = useActionState(changePassword, undefined)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Сменить пароль
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <Input name="user" type="hidden" value={user.firstName} />
          <div className="space-y-2">
            <Label htmlFor="current-password">Текущий пароль</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">Новый пароль</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Подтвердите новый пароль</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isPending}
            />
          </div>

          <Button type="submit" className="cursor-pointer" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Сменить пароль
              </>
            ) : (
              <>Сменить пароль</>
            )}
          </Button>

          <p>{state?.message}</p>
        </form>
      </CardContent>
    </Card>
  )
}
