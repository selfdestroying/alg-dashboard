'use client'

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/src/components/ui/sidebar'
import { useSessionQuery } from '@/src/data/user/session-query'
import type { OrganizationRole } from '@/src/lib/auth/server'
import { Building, Folder, LayoutDashboard, Users, Wallet } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import { filterNavByFeatures } from './lib/filter-nav-by-features'
import { filterNavByRole } from './lib/filter-nav-by-role'
import type { NavGroup } from './lib/types'
import NavGroupList from './nav-group-list'

const navLists: NavGroup[] = [
  {
    title: 'Школа',
    icon: Building,
    roles: ['owner', 'manager'],
    items: [
      {
        title: 'Сотрудники',
        url: '/organization/members',
        roles: ['owner', 'manager'],
      },
      {
        title: 'Ставки',
        url: '/organization/rates',
        roles: ['owner', 'manager'],
        featureKey: 'organization.rates',
      },
      {
        title: 'Курсы',
        url: '/organization/courses',
        roles: ['owner', 'manager'],
        featureKey: 'organization.courses',
      },
      {
        title: 'Локации',
        url: '/organization/locations',
        roles: ['owner', 'manager'],
        featureKey: 'organization.locations',
      },
    ],
  },
  {
    title: 'Ученики',
    icon: Users,
    roles: ['owner', 'manager', 'teacher'],
    featureKey: 'students',
    items: [
      {
        title: 'Все',
        url: '/students',
        roles: ['owner', 'manager', 'teacher'],
      },
      {
        title: 'Активные',
        url: '/students/active',
        roles: ['owner', 'manager'],
        featureKey: 'students.active',
      },
      {
        title: 'Пропустившие',
        url: '/students/absent',
        roles: ['owner', 'manager'],
        featureKey: 'students.absent',
      },
      {
        title: 'Отчисленные',
        url: '/students/dismissed',
        roles: ['owner', 'manager'],
        featureKey: 'students.dismissed',
      },
    ],
  },
  {
    title: 'Группы',
    icon: Folder,
    roles: ['owner', 'manager', 'teacher'],
    featureKey: 'groups',
    items: [
      {
        title: 'Все',
        url: '/groups',
        roles: ['owner', 'manager', 'teacher'],
      },
      {
        title: 'Типы',
        url: '/groups/types',
        roles: ['owner', 'manager'],
        featureKey: 'groups.types',
      },
    ],
  },
  {
    title: 'Финансы',
    icon: Wallet,
    roles: ['owner', 'manager', 'teacher'],
    featureKey: 'finances',
    items: [
      {
        title: 'Оплаты',
        url: '/finances/payments',
        roles: ['owner', 'manager'],
        featureKey: 'finances.payments',
      },
      {
        title: 'Неразобранное',
        url: '/finances/unprocessed',
        roles: ['owner', 'manager'],
        featureKey: 'finances.unprocessedPayments',
      },
      {
        title: 'Выручка',
        url: '/finances/revenue',
        roles: ['owner'],
        featureKey: 'finances.revenue',
      },
      {
        title: 'Зарплаты',
        url: '/finances/salaries',
        roles: ['owner', 'manager', 'teacher'],
        featureKey: 'finances.salaries',
      },
    ],
  },
]

export default function NavPlatform() {
  const { data: session, isLoading } = useSessionQuery()
  const pathname = usePathname()
  const role = session?.memberRole as OrganizationRole | undefined

  const filteredNavList = useMemo(() => {
    const disabledFeatures = (session?.disabledFeatures as string[] | undefined) ?? []
    return role ? filterNavByFeatures(filterNavByRole(navLists, role), disabledFeatures) : []
  }, [role, session?.disabledFeatures])

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Платформа</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton isActive={pathname === '/'} render={<Link href="/" />}>
              <LayoutDashboard />
              <span>Панель управления</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      <NavGroupList label="Навигация" groups={filteredNavList} isLoading={isLoading} />
    </>
  )
}
