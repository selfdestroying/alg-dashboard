'use client'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { ChevronRight, Folder, LayoutDashboard, Users, Wallet } from 'lucide-react'
import Link from 'next/link'

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
]

export default function NavPlatform() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Платформа</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton render={<Link href={'/dashboard'} />}>
            <LayoutDashboard />
            <span>Панель управления</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <SidebarMenu>
        {navLists.map((item) => (
          <Collapsible
            key={item.title}
            render={<SidebarMenuItem />}
            defaultOpen
            className="group/collapsible"
          >
            <CollapsibleTrigger render={<SidebarMenuButton tooltip={item.title} />}>
              {item.icon && <item.icon />}
              <span>{item.title}</span>
              <ChevronRight className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {item.items?.map((subItem) => (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton render={<Link href={subItem.url} />}>
                      <span>{subItem.title}</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
