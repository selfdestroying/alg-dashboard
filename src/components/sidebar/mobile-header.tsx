'use client'

import { Button } from '@/src/components/ui/button'
import { useSidebar } from '@/src/components/ui/sidebar'
import { Menu } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Item, ItemActions, ItemContent, ItemTitle } from '../ui/item'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Панель управления',
  '/dashboard/organization/members': 'Пользователи',
  '/dashboard/students': 'Все ученики',
  '/dashboard/students/active': 'Активные ученики',
  '/dashboard/students/absent': 'Пропустившие',
  '/dashboard/students/dismissed': 'Отчисленные',
  '/dashboard/groups': 'Группы',
  '/dashboard/finances/payments': 'Оплаты',
  '/dashboard/finances/revenue': 'Выручка',
  '/dashboard/finances/salaries': 'Зарплаты',
  '/dashboard/shop/products': 'Товары',
  '/dashboard/shop/categories': 'Категории',
  '/dashboard/shop/orders': 'Заказы',
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
        <Button variant="ghost" size="icon-xs" onClick={toggleSidebar}>
          <Menu />
          <span className="sr-only">Открыть меню</span>
        </Button>
      </ItemActions>
    </Item>
  )
}
