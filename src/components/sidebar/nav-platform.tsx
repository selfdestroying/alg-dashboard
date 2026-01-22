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
import { useAuth } from '@/providers/auth-provider'
import { RoleCodes } from '@/shared/permissions'
import { ChevronRight, Folder, LayoutDashboard, Users, Wallet } from 'lucide-react'
import Link from 'next/link'

const navLists = [
  {
    title: 'Пользователи',
    icon: Users,
    roles: [RoleCodes.admin, RoleCodes.owner, RoleCodes.manager],
    items: [
      {
        title: 'Все',
        url: '/dashboard/users',
        roles: [RoleCodes.admin, RoleCodes.owner, RoleCodes.manager],
      },
    ],
  },
  {
    title: 'Ученики',
    roles: [RoleCodes.admin, RoleCodes.owner, RoleCodes.manager, RoleCodes.teacher],
    icon: Users,
    items: [
      {
        title: 'Все',
        url: '/dashboard/students',
        roles: [RoleCodes.admin, RoleCodes.owner, RoleCodes.manager, RoleCodes.teacher],
      },
      {
        title: 'Активные',
        url: '/dashboard/students/active',
        roles: [RoleCodes.admin, RoleCodes.owner, RoleCodes.manager],
      },
      {
        title: 'Пропустившие',
        url: '/dashboard/students/absent',
        roles: [RoleCodes.admin, RoleCodes.owner, RoleCodes.manager],
      },
      {
        title: 'Отчисленные',
        url: '/dashboard/students/dismissed',
        roles: [RoleCodes.admin, RoleCodes.owner, RoleCodes.manager],
      },
    ],
  },
  {
    title: 'Группы',
    icon: Folder,
    roles: [RoleCodes.admin, RoleCodes.owner, RoleCodes.manager, RoleCodes.teacher],
    items: [
      {
        title: 'Все',
        url: '/dashboard/groups',
        roles: [RoleCodes.admin, RoleCodes.owner, RoleCodes.manager, RoleCodes.teacher],
      },
    ],
  },
  {
    title: 'Финансы',
    icon: Wallet,
    roles: [RoleCodes.admin, RoleCodes.owner, RoleCodes.manager, RoleCodes.teacher],
    items: [
      {
        title: 'Оплаты',
        url: '/dashboard/finances/payments',
        roles: [RoleCodes.admin, RoleCodes.owner, RoleCodes.manager],
      },
      {
        title: 'Выручка',
        url: '/dashboard/finances/revenue',
        roles: [RoleCodes.admin, RoleCodes.owner],
      },
      {
        title: 'Зарплаты',
        url: '/dashboard/finances/salaries',
        roles: [RoleCodes.admin, RoleCodes.owner, RoleCodes.manager, RoleCodes.teacher],
      },
    ],
  },
]

export default function NavPlatform() {
  const { role } = useAuth()

  const filteredNavList = navLists
    .map((item) => ({
      ...item,
      items: item.items.filter((subItem) =>
        subItem.roles.includes(role.code as (typeof RoleCodes)[keyof typeof RoleCodes])
      ),
    }))
    .filter(
      (item) =>
        item.roles.includes(role.code as (typeof RoleCodes)[keyof typeof RoleCodes]) &&
        item.items.length > 0
    )

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
        {filteredNavList.map((item) => (
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
