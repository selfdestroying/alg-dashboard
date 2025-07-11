import * as React from 'react'

import { SearchForm } from '@/components/forms/search-form'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'

import { HandCoins, LayoutDashboard, LogOut, User, Users } from 'lucide-react'
import { NavUser } from './nav-user'
import { getUser } from '@/actions/auth'
import { redirect } from 'next/navigation'

// This is sample data.
const data = {
  navMain: [
    {
      title: 'Общее',
      url: '#',
      items: [
        {
          title: 'Ученики',
          url: '/dashboard/students',
          icon: User,
          roles: ['Teacher', 'Админ', 'Основатель', 'Учитель', 'Менеджер'],
        },
        {
          title: 'Группы',
          url: '/dashboard/groups',
          icon: Users,
          roles: ['Админ', 'Основатель', 'Учитель', 'Менеджер'],
        },
      ],
      roles: ['Админ', 'Основатель', 'Учитель', 'Менеджер'],
    },
    {
      title: 'Менеджер',
      url: '#',
      items: [
        {
          title: 'Оплаты',
          url: '/dashboard/payments',
          icon: HandCoins,
          roles: ['Админ', 'Основатель', 'Менеджер'],
        },
      ],
      roles: ['Админ', 'Основатель', 'Менеджер'],
    },
  ],
}

export async function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = await getUser()
  if (!user) {
    return redirect('/auth')
  }
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <NavUser />
        {/* <SearchForm className="mt-3" /> */}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="group/menu-button font-medium gap-3 h-9 rounded-md bg-gradient-to-r hover:bg-transparent hover:from-sidebar-accent hover:to-sidebar-accent/40 data-[active=true]:from-primary/20 data-[active=true]:to-primary/5 [&>svg]:size-auto"
                >
                  <a href={'/dashboard'}>
                    <LayoutDashboard
                      className="text-muted-foreground/60 group-data-[active=true]/menu-button:text-primary"
                      size={22}
                      aria-hidden="true"
                    />
                    <span>Панель управления</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {data.navMain.map(
          (item) =>
            item.roles.includes(user?.role) && (
              <SidebarGroup key={item.title}>
                <SidebarGroupLabel className="uppercase text-muted-foreground/60">
                  {item.title}
                </SidebarGroupLabel>
                <SidebarGroupContent className="px-2">
                  <SidebarMenu>
                    {item.items.map(
                      (item) =>
                        item.roles.includes(user?.role) && (
                          <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                              asChild
                              className="group/menu-button font-medium gap-3 h-9 rounded-md bg-gradient-to-r hover:bg-transparent hover:from-sidebar-accent hover:to-sidebar-accent/40 data-[active=true]:from-primary/20 data-[active=true]:to-primary/5 [&>svg]:size-auto"
                            >
                              <a href={item.url}>
                                {item.icon && (
                                  <item.icon
                                    className="text-muted-foreground/60 group-data-[active=true]/menu-button:text-primary"
                                    size={22}
                                    aria-hidden="true"
                                  />
                                )}
                                <span>{item.title}</span>
                              </a>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        )
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )
        )}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
