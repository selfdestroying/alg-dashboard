import Salaries from '@/src/features/finances/salaries/components/salaries'
import { auth } from '@/src/lib/auth/server'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

export const metadata = { title: 'Зарплаты' }

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (session?.memberRole !== 'owner') {
    notFound()
  }

  return <Salaries />
}
