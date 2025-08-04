import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex h-screen items-center justify-center gap-4">
      <Button asChild variant={'outline'} size={'lg'}>
        <Link href="/dashboard">Войти в панель управления</Link>
      </Button>
    </div>
  )
}
