'use client'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/src/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/src/components/ui/sidebar'
import { useSessionQuery } from '@/src/data/user/session-query'
import { OrganizationRole } from '@/src/lib/auth'
import { ChevronRight, Folder, LayoutDashboard, Users, Wallet } from 'lucide-react'
import Link from 'next/link'

type NavItem = {
  title: string
  url: string
  roles: OrganizationRole[]
}

type NavGroup = {
  title: string
  icon: typeof Users
  roles: OrganizationRole[]
  items: NavItem[]
}

const navLists: NavGroup[] = [
  {
    title: 'Пользователи',
    icon: Users,
    roles: ['owner', 'manager'],
    items: [
      {
        title: 'Все',
        url: '/dashboard/organization/members',
        roles: ['owner', 'manager'],
      },
    ],
  },
  {
    title: 'Ученики',
    icon: Users,
    roles: ['owner', 'manager', 'teacher'],
    items: [
      {
        title: 'Все',
        url: '/dashboard/students',
        roles: ['owner', 'manager', 'teacher'],
      },
      {
        title: 'Активные',
        url: '/dashboard/students/active',
        roles: ['owner', 'manager'],
      },
      {
        title: 'Пропустившие',
        url: '/dashboard/students/absent',
        roles: ['owner', 'manager'],
      },
      {
        title: 'Отчисленные',
        url: '/dashboard/students/dismissed',
        roles: ['owner', 'manager'],
      },
    ],
  },
  {
    title: 'Группы',
    icon: Folder,
    roles: ['owner', 'manager', 'teacher'],
    items: [
      {
        title: 'Все',
        url: '/dashboard/groups',
        roles: ['owner', 'manager', 'teacher'],
      },
    ],
  },
  {
    title: 'Финансы',
    icon: Wallet,
    roles: ['owner', 'manager', 'teacher'],
    items: [
      {
        title: 'Оплаты',
        url: '/dashboard/finances/payments',
        roles: ['owner', 'manager'],
      },
      {
        title: 'Выручка',
        url: '/dashboard/finances/revenue',
        roles: ['owner'],
      },
      {
        title: 'Зарплаты',
        url: '/dashboard/finances/salaries',
        roles: ['owner', 'manager', 'teacher'],
      },
    ],
  },
]

function filterNavByRole(nav: NavGroup[], role: OrganizationRole): NavGroup[] {
  return nav
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.roles.includes(role)),
    }))
    .filter((group) => group.roles.includes(role) && group.items.length > 0)
}

export default function NavPlatform() {
  const { data: session } = useSessionQuery()
  const role = session?.memberRole as OrganizationRole | undefined

  const filteredNavList = role ? filterNavByRole(navLists, role) : []

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
