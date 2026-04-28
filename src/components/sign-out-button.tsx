'use client'

import { Button } from '@/src/components/ui/button'
import { useSignOutMutation } from '@/src/features/users/me/queries'
import { Loader, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function SignOutButton() {
  const signOutMutation = useSignOutMutation()
  const router = useRouter()

  return (
    <Button
      variant="outline"
      className="w-full"
      disabled={signOutMutation.isPending}
      onClick={() =>
        signOutMutation.mutate(undefined, {
          onSuccess: () => router.refresh(),
        })
      }
    >
      {signOutMutation.isPending ? <Loader className="animate-spin" /> : <LogOut />}
      Выйти
    </Button>
  )
}
