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
import { ChevronRight, ShoppingCart } from 'lucide-react'
import Link from 'next/link'

const navLists = [
  {
    title: 'Магазин',
    icon: ShoppingCart,
    roles: ['ADMIN', 'OWNER', 'MANAGER', 'TEACHER'],
    items: [
      {
        title: 'Товары',
        url: '/dashboard/shop/products',
        roles: ['ADMIN', 'OWNER', 'MANAGER', 'TEACHER'],
      },
      {
        title: 'Категории',
        url: '/dashboard/shop/categories',
        roles: ['ADMIN', 'OWNER', 'MANAGER', 'TEACHER'],
      },
      {
        title: 'Заказы',
        url: '/dashboard/shop/orders',
        roles: ['ADMIN', 'OWNER', 'MANAGER', 'TEACHER'],
      },
    ],
  },
]

export default function NavShop() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Магазин</SidebarGroupLabel>
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
