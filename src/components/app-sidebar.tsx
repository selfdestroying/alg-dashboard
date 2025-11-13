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
import { User } from '@prisma/client'
import {
  Boxes,
  HandCoins,
  House,
  LayoutDashboard,
  LucideProps,
  PackageOpen,
  ReceiptRussianRuble,
  RussianRuble,
  ShoppingCart,
  Store,
  User as UserIcon,
  Users,
  Wallet,
} from 'lucide-react'
import { redirect } from 'next/navigation'
import { NavUser } from './nav-user'

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
      // {
      //   title: 'Уроки',
      //   url: '/dashboard/lessons',
      //   icon: Presentation,
      //   items: [],
      //   roles: ['ADMIN', 'MANAGER', 'OWNER', 'TEACHER'],
      // },
    ],
    roles: ['ADMIN', 'MANAGER', 'OWNER', 'TEACHER'],
  },
  {
    title: 'Финансы',
    url: '#',
    icon: RussianRuble,
    items: [
      {
        title: 'Выручка',
        url: '/dashboard/revenue',
        icon: HandCoins,
        items: [],
        roles: ['ADMIN', 'OWNER'],
      },
      {
        title: 'Оплаты',
        url: '/dashboard/payments',
        icon: ReceiptRussianRuble,
        items: [],
        roles: ['ADMIN', 'OWNER', 'MANAGER'],
      },
      {
        title: 'Зарплата',
        url: '/dashboard/salaries',
        icon: Wallet,
        items: [],
        roles: ['ADMIN', 'OWNER'],
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
