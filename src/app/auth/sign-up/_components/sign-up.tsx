'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { authClient } from '@/src/lib/auth-client'
import { getRedirectUrl } from '@/src/lib/redirect-after-auth'
import { SignUpForm } from './sign-up-form'

export default function SignUp() {
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
    <Card className="max-h-[90vh] w-full overflow-y-auto rounded-none">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Sign Up</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Enter your email below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <SignUpForm onSuccess={handleSuccess} />
        </div>
      </CardContent>
    </Card>
  )
}
