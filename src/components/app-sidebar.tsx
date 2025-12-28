'use client'

import { ChevronDown, ChevronUp, LayoutDashboard, ShoppingCart, Users, Wallet } from 'lucide-react'
import { usePathname } from 'next/navigation'
import * as React from 'react'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { useData } from '@/providers/data-provider'
import { Folder } from 'lucide-react'
import Link from 'next/link'
import { NavUser } from './nav-user'

// This is sample data.
const navLists = [
  {
    title: 'Пользователи',
    icon: Users,
    roles: ['ADMIN', 'OWNER', 'MANAGER'],
    items: [
      {
        title: 'Все',
        url: '/dashboard/users',
        roles: ['ADMIN', 'OWNER', 'MANAGER'],
      },
    ],
  },
  {
    title: 'Ученики',
    roles: ['ADMIN', 'OWNER', 'MANAGER', 'TEACHER'],
    icon: Users,
    items: [
      {
        title: 'Все',
        url: '/dashboard/students',
        roles: ['ADMIN', 'OWNER', 'MANAGER', 'TEACHER'],
      },
      {
        title: 'Активные',
        url: '/dashboard/students/active',
        roles: ['ADMIN', 'OWNER', 'MANAGER'],
      },
      {
        title: 'Пропустившие',
        url: '/dashboard/students/absent',
        roles: ['ADMIN', 'OWNER', 'MANAGER'],
      },
      {
        title: 'Отчисленные',
        url: '/dashboard/students/dismissed',
        roles: ['ADMIN', 'OWNER', 'MANAGER'],
      },
    ],
  },
  {
    title: 'Группы',
    icon: Folder,
    roles: ['ADMIN', 'OWNER', 'MANAGER', 'TEACHER'],
    items: [
      {
        title: 'Все',
        url: '/dashboard/groups',
        roles: ['ADMIN', 'OWNER', 'MANAGER', 'TEACHER'],
      },
    ],
  },
  {
    title: 'Финансы',
    icon: Wallet,
    roles: ['ADMIN', 'OWNER', 'MANAGER', 'TEACHER'],
    items: [
      {
        title: 'Оплаты',
        url: '/dashboard/finances/payments',
        roles: ['ADMIN', 'OWNER', 'MANAGER'],
      },
      {
        title: 'Выручка',
        url: '/dashboard/finances/revenue',
        roles: ['ADMIN', 'OWNER'],
      },
      {
        title: 'Зарплаты',
        url: '/dashboard/finances/salaries',
        roles: ['ADMIN', 'OWNER', 'MANAGER', 'TEACHER'],
      },
    ],
  },
  {
    title: 'Магазин',
    icon: ShoppingCart,
    roles: ['ADMIN', 'OWNER', 'MANAGER', 'TEACHER'],
    items: [
      {
        title: 'Товары',
        url: '/dashboard/shop/products',
        roles: ['ADMIN', 'OWNER', 'MANAGER', 'TEACHER'],
      },
      {
        title: 'Категории',
        url: '/dashboard/shop/categories',
        roles: ['ADMIN', 'OWNER', 'MANAGER', 'TEACHER'],
      },
      {
        title: 'Заказы',
        url: '/dashboard/shop/orders',
        roles: ['ADMIN', 'OWNER', 'MANAGER', 'TEACHER'],
      },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { user } = useData()

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <NavUser />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild size="sm" isActive={pathname === '/dashboard'}>
                <Link href="/dashboard">
                  <LayoutDashboard />
                  Панель управления
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Списки</SidebarGroupLabel>
          <SidebarMenu>
            {navLists.map(
              (item) =>
                item.roles.includes(user!.role) && (
                  <Collapsible key={item.title} defaultOpen className="group/collapsible">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton size="sm" className="cursor-pointer">
                          <item.icon />
                          {item.title}{' '}
                          <ChevronDown className="ml-auto group-data-[state=open]/collapsible:hidden" />
                          <ChevronUp className="ml-auto group-data-[state=closed]/collapsible:hidden" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      {item.items?.length ? (
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map(
                              (subItem) =>
                                subItem.roles.includes(user!.role) && (
                                  <SidebarMenuSubItem key={subItem.title}>
                                    <SidebarMenuSubButton
                                      asChild
                                      size="sm"
                                      isActive={pathname === subItem.url}
                                    >
                                      <Link href={subItem.url}>{subItem.title}</Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                )
                            )}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      ) : null}
                    </SidebarMenuItem>
                  </Collapsible>
                )
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
