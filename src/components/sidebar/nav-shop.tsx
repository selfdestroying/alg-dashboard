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
import { ChevronRight, ShoppingCart } from 'lucide-react'
import Link from 'next/link'

type NavItem = {
  title: string
  url: string
  roles: OrganizationRole[]
}

type NavGroup = {
  title: string
  icon: typeof ShoppingCart
  roles: OrganizationRole[]
  items: NavItem[]
}

const navLists: NavGroup[] = [
  {
    title: 'Магазин',
    icon: ShoppingCart,
    roles: ['owner', 'manager', 'teacher'],
    items: [
      {
        title: 'Товары',
        url: '/dashboard/shop/products',
        roles: ['owner', 'manager', 'teacher'],
      },
      {
        title: 'Категории',
        url: '/dashboard/shop/categories',
        roles: ['owner', 'manager', 'teacher'],
      },
      {
        title: 'Заказы',
        url: '/dashboard/shop/orders',
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

export default function NavShop() {
  const { data: session } = useSessionQuery()
  const role = session?.memberRole as OrganizationRole | undefined

  const filteredNavList = role ? filterNavByRole(navLists, role) : []
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Магазин</SidebarGroupLabel>
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
