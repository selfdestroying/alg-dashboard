import * as React from 'react'

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
  SidebarRail,
} from '@/components/ui/sidebar'

import { getUser } from '@/actions/users'
import prisma from '@/lib/prisma'
import { Role, User } from '@prisma/client'
import bcrypt from 'bcrypt'
import {
  Boxes,
  FolderKanban,
  HandCoins,
  House,
  LayoutDashboard,
  LucideProps,
  PackageOpen,
  Presentation,
  ShoppingCart,
  Store,
  User as UserIcon,
  Users,
} from 'lucide-react'
import { redirect } from 'next/navigation'
import { NavUser } from './nav-user'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from './ui/dialog'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface NavData {
  title: string
  url: string
  icon: React.ForwardRefExoticComponent<Omit<LucideProps, 'ref'>>
  items: NavData[]
  roles: User['role'][]
}

const data: NavData[] = [
  {
    title: 'Общее',
    url: '#',
    icon: House,
    items: [
      {
        title: 'Ученики',
        url: '/dashboard/students',
        icon: UserIcon,
        items: [],
        roles: ['ADMIN', 'MANAGER', 'OWNER', 'TEACHER'],
      },
      {
        title: 'Группы',
        url: '/dashboard/groups',
        icon: Users,
        items: [],
        roles: ['ADMIN', 'MANAGER', 'OWNER', 'TEACHER'],
      },
      {
        title: 'Уроки',
        url: '/dashboard/lessons',
        icon: Presentation,
        items: [],
        roles: ['ADMIN', 'MANAGER', 'OWNER', 'TEACHER'],
      },
    ],
    roles: ['ADMIN', 'MANAGER', 'OWNER', 'TEACHER'],
  },
  {
    title: 'Менеджер',
    url: '#',
    icon: FolderKanban,
    items: [
      {
        title: 'Оплаты',
        url: '/dashboard/payments',
        icon: HandCoins,
        items: [],
        roles: ['ADMIN', 'OWNER', 'MANAGER'],
      },
    ],
    roles: ['ADMIN', 'OWNER', 'MANAGER'],
  },
  {
    title: 'Магазин',
    url: '#',
    icon: Store,
    items: [
      {
        title: 'Товары',
        url: '/dashboard/products',
        icon: Boxes,
        items: [],
        roles: ['ADMIN', 'MANAGER', 'OWNER', 'TEACHER'],
      },
      {
        title: 'Категории',
        url: '/dashboard/categories',
        icon: PackageOpen,
        items: [],
        roles: ['ADMIN', 'MANAGER', 'OWNER', 'TEACHER'],
      },
      {
        title: 'Заказы',
        url: '/dashboard/orders',
        icon: ShoppingCart,
        items: [],
        roles: ['ADMIN', 'MANAGER', 'OWNER', 'TEACHER'],
      },
    ],
    roles: ['ADMIN', 'MANAGER', 'OWNER', 'TEACHER'],
  },
]

export async function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = await getUser()
  if (!user) {
    return redirect('/auth')
  }

  const addTeacher = async (formData: FormData) => {
    'use server'
    const firstName = formData.get('name') as string
    const role = formData.get('role') as Role
    const password = formData.get('password') as string

    await prisma.user.create({
      data: { firstName, role, password: await bcrypt.hash(password, 10), passwordRequired: true },
    })
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <NavUser />
        {/* <SearchForm className="mt-3" /> */}
        <Dialog>
          <DialogTrigger asChild>
            <Button>Добавить учителя</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Добавить учителя</DialogTitle>
            <form action={addTeacher}>
              <Input type="text" name="name" />
              <Select name="role">
                <SelectTrigger>
                  <SelectValue placeholder="роль" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(Role).map((role) => (
                    <SelectItem value={role} key={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input type="text" name="password" />
              <Button type="submit">Добавить</Button>
            </form>
          </DialogContent>
        </Dialog>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="group/menu-button hover:from-sidebar-accent hover:to-sidebar-accent/40 data-[active=true]:from-primary/20 data-[active=true]:to-primary/5 h-9 gap-3 rounded-md bg-gradient-to-r font-medium hover:bg-transparent [&>svg]:size-auto"
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
        {data.map(
          (item) =>
            item.roles.includes(user?.role) && (
              <SidebarGroup key={item.title}>
                <SidebarGroupLabel className="text-muted-foreground/60 flex items-center gap-2 uppercase">
                  <item.icon />
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
                              className="group/menu-button hover:from-sidebar-accent hover:to-sidebar-accent/40 data-[active=true]:from-primary/20 data-[active=true]:to-primary/5 h-9 gap-3 rounded-md bg-gradient-to-r font-medium hover:bg-transparent [&>svg]:size-auto"
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
