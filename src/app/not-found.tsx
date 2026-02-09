import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/src/components/ui/empty'
import { House } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../components/ui/button'

export default function NotFound() {
  return (
    <div className="grid h-screen">
      <Empty>
        <EmptyHeader>
          <EmptyTitle>404 - Страница не найдена</EmptyTitle>
          <EmptyDescription>
            Мы не нашли страницу, на которую вы пытались перейти. Возможно, она была перемещена или
            ссылка больше не актуальна.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant={'outline'} nativeButton={false} render={<Link href={'/'} />}>
            <House />
            На главную
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
