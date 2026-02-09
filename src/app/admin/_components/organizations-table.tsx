'use client'

import { Badge } from '@/src/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Input } from '@/src/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import CreateOrganizationDialog from './create-organization-dialog'
import type { AdminDashboardData } from './types'

interface OrganizationsTableProps {
  data: AdminDashboardData
  onRefresh: () => void
}

export default function OrganizationsTable({ data }: OrganizationsTableProps) {
  const [search, setSearch] = useState('')

  const filteredOrganizations = useMemo(() => {
    if (!search.trim()) return data.organizations
    const q = search.toLowerCase()
    return data.organizations.filter(
      (o) => o.name.toLowerCase().includes(q) || o.slug.toLowerCase().includes(q)
    )
  }, [data.organizations, search])

  const getMemberRoleCounts = (members: AdminDashboardData['organizations'][number]['members']) => {
    const counts: Record<string, number> = {}
    members.forEach((m) => {
      counts[m.role] = (counts[m.role] || 0) + 1
    })
    return counts
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Организации ({data.organizations.length})</span>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Поиск по названию, slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <CreateOrganizationDialog />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredOrganizations.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">Организации не найдены</p>
          ) : (
            filteredOrganizations.map((org) => {
              const roleCounts = getMemberRoleCounts(org.members)
              return (
                <Card key={org.id} className="bg-muted/30">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-base">
                          {org.name}
                          <Badge variant="secondary" className="text-xs font-normal">
                            {org.slug}
                          </Badge>
                        </CardTitle>
                        <p className="text-muted-foreground mt-1 text-xs">
                          Создана: {format(new Date(org.createdAt), 'dd MMM yyyy', { locale: ru })}
                          {' · '}
                          ID: {org.id}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1">
                          <Users className="size-3" />
                          {org.members.length}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Роли */}
                    <div className="mb-3 flex flex-wrap gap-2">
                      {Object.entries(roleCounts).map(([role, count]) => (
                        <Badge key={role} variant="outline" className="text-xs">
                          {role}: {count}
                        </Badge>
                      ))}
                    </div>

                    {/* Участники */}
                    {org.members.length > 0 && (
                      <div className="overflow-auto rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-12">ID</TableHead>
                              <TableHead>Пользователь</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Роль в организации</TableHead>
                              <TableHead>Дата вступления</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {org.members.map((member) => (
                              <TableRow key={member.id}>
                                <TableCell className="font-mono text-xs">{member.id}</TableCell>
                                <TableCell className="font-medium">{member.user.name}</TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                  {member.user.email}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={member.role === 'owner' ? 'default' : 'secondary'}
                                  >
                                    {member.role}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-xs">
                                  {format(new Date(member.createdAt), 'dd.MM.yyyy HH:mm', {
                                    locale: ru,
                                  })}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
