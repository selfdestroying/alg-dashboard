import { LogIn } from 'lucide-react'

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import Link from 'next/link'
import { getUser } from '@/lib/dal'
import DropDownUser from '@/components/dropdown-user'

export default async function NavUser() {
  const user = await getUser()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {user ? (
          <DropDownUser user={user} />
        ) : (
          <SidebarMenuButton asChild>
            <Link href="/auth">
              <LogIn />
              Login
            </Link>
          </SidebarMenuButton>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
