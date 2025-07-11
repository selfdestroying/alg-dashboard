import { apiGet } from '@/actions/api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { IUser } from '@/types/user'

import { RiLogoutBoxLine } from '@remixicon/react'
import { ArrowLeftRight, LogOut } from 'lucide-react'

export default async function UserDropdown() {
  const users = await apiGet<IUser[]>('users')
  if (!users.success) {
    return <div>{users.message}</div>
  }
  const teachers = users.data.filter((u) => u.role.name == 'Учитель')
  const owners = users.data.filter((u) => u.role.name == 'Основатель')
  const managers = users.data.filter((u) => u.role.name == 'Менеджер')
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
          <Avatar className="size-8">
            <AvatarImage
              src="https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/user_sam4wh.png"
              width={32}
              height={32}
              alt="Profile image"
            />
            <AvatarFallback>KK</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem>
          <ArrowLeftRight size={16} className="opacity-60" aria-hidden="true" />
          <span>Сменить аккаунт</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <LogOut size={16} className="opacity-60" aria-hidden="true" />
          <span>Выйти</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
