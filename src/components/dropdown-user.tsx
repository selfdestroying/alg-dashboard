'use client'

import { ChevronsUpDown, BadgeCheck, LogOut } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { SidebarMenuButton } from './ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { IUser } from '@/types/user'
import { deleteSession } from '@/lib/session'
import { toast } from 'sonner'
import { Badge } from './ui/badge'

export default function DropDownUser({ user }: { user: IUser }) {
  const onLogout = () => {
    const ok = new Promise<void>((resolve) => {
      deleteSession()
      resolve()
    })

    toast.promise(ok, {
      loading: 'Загрузка...',
      success: () => 'Вы усешно вышли из аккаунта',
    })
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton size="lg" className="cursor-pointer py-0 h-fit">
          <Avatar className="h-8 w-8">
            <AvatarImage alt={user.name} />
            <AvatarFallback className="rounded-lg">
              {user.name.toUpperCase().slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-2">
            <span className="truncate font-medium">{user.name}</span>
            <Badge variant={'outline'} className="truncate text-xs">
              {user.role}
            </Badge>
          </div>
          <ChevronsUpDown className="ml-auto size-4" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer">
            <BadgeCheck />
            Аккаунт
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={onLogout}>
          <LogOut />
          Выйти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
