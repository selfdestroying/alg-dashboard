'use client'

import { useSessionQuery } from '@/src/data/user/session-query'
import type { OrganizationRole } from '@/src/lib/auth/server'
import { ShoppingCart } from 'lucide-react'
import { useMemo } from 'react'
import { filterNavByFeatures } from './lib/filter-nav-by-features'
import { filterNavByRole } from './lib/filter-nav-by-role'
import type { NavGroup } from './lib/types'
import NavGroupList from './nav-group-list'

const navLists: NavGroup[] = [
  {
    title: 'Магазин',
    icon: ShoppingCart,
    roles: ['owner', 'manager', 'teacher'],
    featureKey: 'shop',
    items: [
      {
        title: 'Товары',
        url: '/shop/products',
        roles: ['owner', 'manager', 'teacher'],
        featureKey: 'shop.products',
      },
      {
        title: 'Категории',
        url: '/shop/categories',
        roles: ['owner', 'manager', 'teacher'],
        featureKey: 'shop.categories',
      },
      {
        title: 'Заказы',
        url: '/shop/orders',
        roles: ['owner', 'manager', 'teacher'],
        featureKey: 'shop.orders',
      },
    ],
  },
]

export default function NavShop() {
  const { data: session, isLoading } = useSessionQuery()
  const role = session?.memberRole as OrganizationRole | undefined

  const filteredNavList = useMemo(() => {
    const disabledFeatures = (session?.disabledFeatures as string[] | undefined) ?? []
    return role ? filterNavByFeatures(filterNavByRole(navLists, role), disabledFeatures) : []
  }, [role, session?.disabledFeatures])

  return <NavGroupList label="Магазин" groups={filteredNavList} isLoading={isLoading} />
}
