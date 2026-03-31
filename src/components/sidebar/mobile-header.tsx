'use client'

import { Button } from '@/src/components/ui/button'
import { useSidebar } from '@/src/components/ui/sidebar'
import { SmartFeed } from '@/src/features/smart-feed/components/smart-feed'
import { Menu } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Item, ItemActions, ItemContent, ItemTitle } from '../ui/item'

const pageTitles: Record<string, string> = {
  '/': 'Панель управления',
  '/organization/members': 'Пользователи',
  '/students': 'Все ученики',
  '/students/active': 'Активные ученики',
  '/students/absent': 'Пропустившие',
  '/students/dismissed': 'Отчисленные',
  '/groups': 'Группы',
  '/finances/payments': 'Оплаты',
  '/finances/revenue': 'Выручка',
  '/finances/salaries': 'Зарплаты',
  '/finances/advances': 'Авансы',
  '/finances/payment-methods': 'Методы оплаты',
  '/shop/products': 'Товары',
  '/shop/categories': 'Категории',
  '/shop/orders': 'Заказы',
}

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname]

  // Попробовать найти ближайший родительский маршрут
  const segments = pathname.split('/')
  while (segments.length > 1) {
    segments.pop()
    const parent = segments.join('/')
    if (pageTitles[parent]) return pageTitles[parent]
  }

  return 'ЕДУДА'
}

export default function MobileHeader() {
  const pathname = usePathname()
  const { isMobile, toggleSidebar } = useSidebar()

  if (!isMobile) return null

  return (
    <Item variant="muted" size="xs">
      <ItemContent>
        <ItemTitle>{getPageTitle(pathname)}</ItemTitle>
      </ItemContent>
      <ItemActions>
        <SmartFeed />
        <Button variant="ghost" size="icon-xs" onClick={toggleSidebar}>
          <Menu />
          <span className="sr-only">Открыть меню</span>
        </Button>
      </ItemActions>
    </Item>
  )
}
