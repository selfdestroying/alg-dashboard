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
import { Folder } from 'lucide-react'
import Link from 'next/link'
import { NavUser } from './nav-user'

// This is sample data.
const navLists = [
  {
    title: 'Ученики',
    icon: Users,
    items: [
      {
        title: 'Все',
        url: '/dashboard/students',
      },
      {
        title: 'Активные',
        url: '/dashboard/students/active',
      },
      {
        title: 'Пропустившие',
        url: '/dashboard/students/absent',
      },
      {
        title: 'Отчисленные',
        url: '/dashboard/students/dismissed',
      },
    ],
  },
  {
    title: 'Группы',
    icon: Folder,
    items: [
      {
        title: 'Все',
        url: '/dashboard/groups',
      },
    ],
  },
  {
    title: 'Финансы',
    icon: Wallet,
    items: [
      {
        title: 'Оплаты',
        url: '/dashboard/finances/payments',
      },
      {
        title: 'Выручка',
        url: '/dashboard/finances/revenue',
      },
      {
        title: 'Зарплаты',
        url: '/dashboard/finances/salaries',
      },
    ],
  },
  {
    title: 'Магазин',
    icon: ShoppingCart,
    items: [
      {
        title: 'Товары',
        url: '/dashboard/shop/products',
      },
      {
        title: 'Категории',
        url: '/dashboard/shop/categories',
      },
      {
        title: 'Заказы',
        url: '/dashboard/shop/orders',
      },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

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
            {navLists.map((item) => (
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
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              size="sm"
                              isActive={pathname === subItem.url}
                            >
                              <Link href={subItem.url}>{subItem.title}</Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  ) : null}
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
