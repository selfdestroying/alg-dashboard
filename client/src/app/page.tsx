import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex items-center justify-center w-full h-screen bg-accent">
      <Button asChild variant={'outline'} size={'lg'}>
        <Link href="/dashboard">Get Started</Link>
      </Button>
    </div>
  )
}
