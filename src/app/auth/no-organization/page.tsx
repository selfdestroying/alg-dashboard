'use client'

import { Button } from '@/src/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { useSignOutMutation } from '@/src/data/user/sign-out-mutation'
import { Building2, Loader, LogOut } from 'lucide-react'
import router from 'next/router'

export default function NoOrganizationPage() {
  const signOutMutation = useSignOutMutation()

  return (
    <div className="w-full">
      <div className="flex w-full flex-col items-center justify-center md:py-10">
        <div className="w-full max-w-md">
          <Card className="w-full rounded-none">
            <CardHeader className="text-center">
              <div className="bg-muted mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                <Building2 className="text-muted-foreground h-6 w-6" />
              </div>
              <CardTitle className="text-lg md:text-xl">Нет организации</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Вы не состоите ни в одной организации. Обратитесь к администратору для получения
                приглашения.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-muted-foreground text-center text-sm">
                После того как вас добавят в организацию, войдите в систему снова.
              </p>
              <Button
                className="z-10 gap-2"
                variant="outline"
                onClick={() => {
                  signOutMutation.mutate(undefined, {
                    onSuccess: () => {
                      router.push('/')
                    },
                  })
                }}
                disabled={signOutMutation.isPending}
              >
                <span className="text-sm">
                  {signOutMutation.isPending ? (
                    <Loader className="animate-spin" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <LogOut />
                      Выйти
                    </div>
                  )}
                </span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
