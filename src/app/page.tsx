import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
import { House, LogIn } from 'lucide-react'
import { headers } from 'next/headers'
import Link from 'next/link'
import { auth } from '../lib/auth'
import { protocol, rootDomain } from '../lib/utils'

export default async function HomePage() {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({
    headers: requestHeaders,
  })

  return (
    <main className="flex min-h-screen items-center justify-center">
      <Card className="w-85 rounded-2xl shadow-lg">
        <CardContent className="flex flex-col items-center gap-6 p-6 text-center">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">ЕДУДА</h1>
            <p className="text-muted-foreground text-sm">Единый учёт данных</p>
          </div>

          {session ? (
            <Button
              className={'w-full'}
              nativeButton={false}
              render={
                <Link
                  href={`${protocol}://${session.members[0].organization.slug}.${rootDomain}`}
                />
              }
            >
              В школу
              <House />
            </Button>
          ) : (
            <Button
              className={'w-full'}
              nativeButton={false}
              render={<Link href={`${protocol}://auth.${rootDomain}`} />}
            >
              Войти
              <LogIn />
            </Button>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
