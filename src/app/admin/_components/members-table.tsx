'use client'

import { CustomCombobox } from '@/src/components/custom-combobox'
import DataTable from '@/src/components/data-table'
import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/components/ui/dialog'
import { Input } from '@/src/components/ui/input'
import { authClient } from '@/src/lib/auth/client'
import {
  type ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Loader, Trash2 } from 'lucide-react'
import { useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'
import type { AdminDashboardData } from './types'

interface MembersTableProps {
  data: AdminDashboardData
  onRefresh: () => void
}

type FlatMember = {
  memberId: number
  userId: number
  userName: string
  userEmail: string
  role: string
  organizationId: number
  organizationName: string
  organizationSlug: string
  createdAt: Date
  banned: boolean | null
}

export default function MembersTable({ data, onRefresh }: MembersTableProps) {
  const [search, setSearch] = useState('')
  const [orgFilter, setOrgFilter] = useState<string | null>('all')
  const [roleFilter, setRoleFilter] = useState<string | null>('all')
  const [isPending, startTransition] = useTransition()
  const [loadingMemberId, setLoadingMemberId] = useState<number | null>(null)

  const flatMembers = useMemo<FlatMember[]>(() => {
    return data.organizations.flatMap((org) =>
      org.members.map((member) => ({
        memberId: member.id,
        userId: member.userId,
        userName: member.user.name,
        userEmail: member.user.email,
        role: member.role,
        organizationId: org.id,
        organizationName: org.name,
        organizationSlug: org.slug,
        createdAt: new Date(member.createdAt),
        banned: data.users.find((u) => u.id === member.userId)?.banned ?? null,
      })),
    )
  }, [data])

  const filteredMembers = useMemo(() => {
    let result = flatMembers
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (m) =>
          m.userName.toLowerCase().includes(q) ||
          m.userEmail.toLowerCase().includes(q) ||
          m.organizationName.toLowerCase().includes(q),
      )
    }
    if (orgFilter && orgFilter !== 'all') {
      result = result.filter((m) => m.organizationId.toString() === orgFilter)
    }
    if (roleFilter && roleFilter !== 'all') {
      result = result.filter((m) => m.role === roleFilter)
    }
    return result
  }, [flatMembers, search, orgFilter, roleFilter])

  const allRoles = useMemo(() => {
    return [...new Set(flatMembers.map((m) => m.role))]
  }, [flatMembers])

  const handleRemoveMember = (memberId: number, organizationId: number) => {
    setLoadingMemberId(memberId)
    startTransition(async () => {
      try {
        await authClient.organization.removeMember({
          memberIdOrEmail: memberId.toString(),
          organizationId: organizationId.toString(),
        })
        toast.success('Участник удалён')
        onRefresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Ошибка удаления')
      } finally {
        setLoadingMemberId(null)
      }
    })
  }

  const columns: ColumnDef<FlatMember>[] = [
    {
      accessorKey: 'memberId',
      header: 'ID',
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.memberId}</span>,
    },
    {
      accessorKey: 'userName',
      header: 'Пользователь',
      cell: ({ row }) => <span className="font-medium">{row.original.userName}</span>,
    },
    {
      accessorKey: 'userEmail',
      header: 'Email',
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">{row.original.userEmail}</span>
      ),
    },
    {
      accessorKey: 'organizationName',
      header: 'Организация',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs">
          {row.original.organizationName}
        </Badge>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Роль',
      cell: ({ row }) => (
        <Badge variant={row.original.role === 'owner' ? 'default' : 'secondary'}>
          {row.original.role}
        </Badge>
      ),
    },
    {
      id: 'status',
      header: 'Статус',
      cell: ({ row }) =>
        row.original.banned ? (
          <Badge variant="destructive">Бан</Badge>
        ) : (
          <Badge variant="outline">Активен</Badge>
        ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Дата',
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs">
          {format(row.original.createdAt, 'dd.MM.yyyy', { locale: ru })}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const member = row.original
        const isLoading = loadingMemberId === member.memberId && isPending
        if (member.role === 'owner') return null
        return (
          <Dialog>
            <DialogTrigger
              render={
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  disabled={isLoading}
                />
              }
            >
              {isLoading ? (
                <Loader className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Удалить участника?</DialogTitle>
                <DialogDescription>
                  Удалить {member.userName} из {member.organizationName}?
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2">
                <DialogClose render={<Button variant="outline" />}>Отмена</DialogClose>
                <DialogClose
                  render={
                    <Button
                      variant="destructive"
                      onClick={() => handleRemoveMember(member.memberId, member.organizationId)}
                    />
                  }
                >
                  Удалить
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        )
      },
    },
  ]

  const table = useReactTable({
    data: filteredMembers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Участники ({flatMembers.length})</span>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Поиск..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <CustomCombobox
              items={[
                { label: 'Все организации', value: 'all' },
                ...data.organizations.map((org) => ({ label: org.name, value: org.id.toString() })),
              ]}
              value={
                orgFilter
                  ? {
                      label:
                        orgFilter === 'all'
                          ? 'Все организации'
                          : (data.organizations.find((o) => o.id.toString() === orgFilter)?.name ??
                            ''),
                      value: orgFilter,
                    }
                  : null
              }
              onValueChange={(item) => setOrgFilter(item?.value ?? 'all')}
              placeholder="Организация"
              showTrigger={false}
              className="w-44"
            />

            <CustomCombobox
              items={[
                { label: 'Все роли', value: 'all' },
                ...allRoles.map((role) => ({ label: role, value: role })),
              ]}
              value={
                roleFilter
                  ? {
                      label: roleFilter === 'all' ? 'Все роли' : roleFilter,
                      value: roleFilter,
                    }
                  : null
              }
              onValueChange={(item) => setRoleFilter(item?.value ?? 'all')}
              placeholder="Роль"
              showTrigger={false}
              className="w-36"
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable table={table} emptyMessage="Участники не найдены" />
      </CardContent>
    </Card>
  )
}
