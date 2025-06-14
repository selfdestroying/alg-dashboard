import { verifySession } from '@/lib/dal'

export default async function Page() {
  const session = await verifySession()
  const role = session.user?.role as string
}
