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
import { NavUser } from './nav-user'
import { usePathname } from 'next/navigation'

const mainNavItems = [
  {
    title: 'Main',
    url: '/dashboard',
    icon: Home,
    isActive: false,
  },
  {
    title: 'Students',
    url: '/dashboard/students',
    icon: User,
    isActive: false,
  },
  {
    title: 'Groups',
    url: '/dashboard/groups',
    icon: Users,
    isActive: false,
  },
]

const additionalNavItems = [
  {
    title: 'Teachers',
    url: '/dashboard/teachers',
    icon: GraduationCap,
    isActive: false,
  },
]

export interface IUser {
  id: number
  username: string
  role: string
}

export default function DashboardSidebar({ user }: { user: IUser }) {
  const pathname = usePathname()
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <NavUser user={user} />
      </SidebarHeader>
      <SidebarSeparator className="mx-0" />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Section</SidebarGroupLabel>
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
        {user.role == 'Admin' && (
          <>
            <SidebarSeparator className="mx-0" />
            <SidebarGroup>
              <SidebarGroupLabel>Admin Section</SidebarGroupLabel>
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
