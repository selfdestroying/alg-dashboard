'use client'

import { SwitchThemeButton } from '@/src/components/switch-theme-button'
import { authClient } from '@/src/lib/auth-client'
import { getRedirectUrl } from '@/src/lib/redirect-after-auth'
import { SignInForm } from './sign-in-form'

export default function SignIn() {
  const handleSuccess = async () => {
    // Получаем сессию с информацией о членстве в организациях
    const { data: session } = await authClient.getSession()

    if (!session) {
      return
    }

    // Получаем URL для редиректа на основе членства в организациях
    const redirectUrl = getRedirectUrl(session.members ?? [])

    // Редиректим пользователя
    window.location.href = redirectUrl
  }

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="self-end">
          <SwitchThemeButton />
        </div>

        <SignInForm onSuccess={handleSuccess} />
      </div>
    </div>
  )
}
