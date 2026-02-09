'use client'

import { addMember } from '@/src/actions/organizations'
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table'
import { authClient } from '@/src/lib/auth-client'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Loader, Trash2, UserPlus } from 'lucide-react'
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

  // Add member state
  const [addMemberOrgId, setAddMemberOrgId] = useState<string | null>('')
  const [addMemberUserId, setAddMemberUserId] = useState<string | null>('')
  const [addMemberRole, setAddMemberRole] = useState<string | null>('teacher')

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
      }))
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
          m.organizationName.toLowerCase().includes(q)
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

  const handleAddMember = () => {
    if (!addMemberOrgId || !addMemberUserId || !addMemberRole) {
      toast.error('Заполните все поля')
      return
    }
    startTransition(async () => {
      try {
        await addMember({
          userId: addMemberUserId,
          organizationId: addMemberOrgId,
          role: addMemberRole as 'owner' | 'manager' | 'teacher',
        })
        toast.success('Участник добавлен')
        setAddMemberOrgId('')
        setAddMemberUserId('')
        setAddMemberRole('teacher')
        onRefresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Ошибка добавления')
      }
    })
  }

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

            <Select value={orgFilter} onValueChange={setOrgFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Организация" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Все организации</SelectItem>
                  {data.organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id.toString()}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Роль" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Все роли</SelectItem>
                  {allRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* Добавить участника */}
            <Dialog>
              <DialogTrigger render={<Button />}>
                <UserPlus />
                Добавить
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Добавить участника</DialogTitle>
                  <DialogDescription>Выберите пользователя, организацию и роль</DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <Select value={addMemberOrgId} onValueChange={setAddMemberOrgId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите организацию" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {data.organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id.toString()}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <Select value={addMemberUserId} onValueChange={setAddMemberUserId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите пользователя" />
                    </SelectTrigger>
                    <SelectContent className={'w-max'}>
                      <SelectGroup>
                        {data.users.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <Select value={addMemberRole} onValueChange={setAddMemberRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Роль" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="owner">owner</SelectItem>
                        <SelectItem value="manager">manager</SelectItem>
                        <SelectItem value="teacher">teacher</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <DialogClose
                    render={
                      <Button className="w-full" onClick={handleAddMember} disabled={isPending} />
                    }
                  >
                    {isPending ? (
                      <Loader className="mr-2 size-4 animate-spin" />
                    ) : (
                      <UserPlus className="mr-2 size-4" />
                    )}
                    Добавить участника
                  </DialogClose>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">ID</TableHead>
                <TableHead>Пользователь</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Организация</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-muted-foreground text-center">
                    Участники не найдены
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers.map((member) => {
                  const isLoading = loadingMemberId === member.memberId && isPending
                  return (
                    <TableRow key={`${member.organizationId}-${member.memberId}`}>
                      <TableCell className="font-mono text-xs">{member.memberId}</TableCell>
                      <TableCell className="font-medium">{member.userName}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {member.userEmail}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {member.organizationName}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {member.banned ? (
                          <Badge variant="destructive">Бан</Badge>
                        ) : (
                          <Badge variant="outline">Активен</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {format(member.createdAt, 'dd.MM.yyyy', { locale: ru })}
                      </TableCell>
                      <TableCell>
                        {member.role !== 'owner' && (
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
                                <DialogClose render={<Button variant="outline" />}>
                                  Отмена
                                </DialogClose>
                                <DialogClose
                                  render={
                                    <Button
                                      variant="destructive"
                                      onClick={() =>
                                        handleRemoveMember(member.memberId, member.organizationId)
                                      }
                                    />
                                  }
                                >
                                  Удалить
                                </DialogClose>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
