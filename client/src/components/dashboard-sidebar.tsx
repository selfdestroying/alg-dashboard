'use client'
import { GraduationCap, Home, User, Users } from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IUser } from '@/types/user'
import NavUser from '@/app/dashboard/nav-user'

const mainNavItems = [
  {
    title: 'Главная',
    url: '/dashboard',
    icon: Home,
    isActive: false,
  },
  {
    title: 'Ученики',
    url: '/dashboard/students',
    icon: User,
    isActive: false,
  },
  {
    title: 'Группы',
    url: '/dashboard/groups',
    icon: Users,
    isActive: false,
  },
]

const additionalNavItems = [
  {
    title: 'Учителя',
    url: '/dashboard/teachers',
    icon: GraduationCap,
    isActive: false,
  },
]

export default function DashboardSidebar({ user }: { user: IUser | null }) {
  const pathname = usePathname()
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <NavUser />
      </SidebarHeader>
      <SidebarSeparator className="mx-0" />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Общее</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={item.url == pathname}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {user && user.role == 'Admin' && (
          <>
            <SidebarSeparator className="mx-0" />
            <SidebarGroup>
              <SidebarGroupLabel>Администратор</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {additionalNavItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
    </Sidebar>
  )
}
