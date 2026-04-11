'use client'

import { Button } from '@/src/components/ui/button'
import { useSidebar } from '@/src/components/ui/sidebar'
import { useSessionQuery } from '@/src/data/user/session-query'
import { QuickTip } from '@/src/features/smart-feed/components/quick-tip'
import { SmartFeed } from '@/src/features/smart-feed/components/smart-feed'
import type { OrganizationRole } from '@/src/lib/auth/server'
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
  '/smart-feed': 'Smart Feed',
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
  const { data: session } = useSessionQuery()
  const role = session?.memberRole as OrganizationRole | undefined
  const canSeeFeed = role === 'owner' || role === 'manager'

  if (!isMobile) return null

  return (
    <Item size="xs" className="ring-foreground/10 bg-card text-card-foreground ring-1">
      <ItemContent>
        <ItemTitle>
          {getPageTitle(pathname)}
          <QuickTip />
        </ItemTitle>
      </ItemContent>
      <ItemActions>
        {canSeeFeed && <SmartFeed />}
        <Button variant="ghost" size="icon-xs" onClick={toggleSidebar}>
          <Menu />
          <span className="sr-only">Открыть меню</span>
        </Button>
      </ItemActions>
    </Item>
  )
}
