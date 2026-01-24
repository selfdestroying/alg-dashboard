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
import { ChevronRight, ShoppingCart } from 'lucide-react'
import Link from 'next/link'

const navLists = [
  {
    title: 'Магазин',
    icon: ShoppingCart,
    roles: [RoleCodes.admin, RoleCodes.owner, RoleCodes.manager, RoleCodes.teacher],
    items: [
      {
        title: 'Товары',
        url: '/dashboard/shop/products',
        roles: [RoleCodes.admin, RoleCodes.owner, RoleCodes.manager, RoleCodes.teacher],
      },
      {
        title: 'Категории',
        url: '/dashboard/shop/categories',
        roles: [RoleCodes.admin, RoleCodes.owner, RoleCodes.manager, RoleCodes.teacher],
      },
      {
        title: 'Заказы',
        url: '/dashboard/shop/orders',
        roles: [RoleCodes.admin, RoleCodes.owner, RoleCodes.manager, RoleCodes.teacher],
      },
    ],
  },
]

export default function NavShop() {
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
