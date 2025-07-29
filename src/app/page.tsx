import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex h-screen items-center justify-center gap-4">
      <Button asChild variant={'outline'} size={'lg'}>
        <Link href="/dashboard">Я учитель</Link>
      </Button>
      <Button asChild variant={'outline'} size={'lg'}>
        <Link href="/shop">Я ученик</Link>
      </Button>
    </div>
  )
}
