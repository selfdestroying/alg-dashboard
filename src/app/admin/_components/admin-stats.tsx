'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Building2, Shield, UserCheck, Users } from 'lucide-react'
import type { AdminDashboardData } from './types'

interface AdminStatsProps {
  data: AdminDashboardData
}

export default function AdminStats({ data }: AdminStatsProps) {
  const totalMembers = data.organizations.reduce((acc, org) => acc + org.members.length, 0)
  const activeUsers = data.users.filter((u) => !u.banned).length
  const bannedUsers = data.users.filter((u) => u.banned).length

  const stats = [
    {
      title: 'Пользователи',
      value: data.users.length,
      description: `${activeUsers} активных`,
      icon: Users,
    },
    {
      title: 'Организации',
      value: data.organizations.length,
      description: `${totalMembers} участников`,
      icon: Building2,
    },
    {
      title: 'Участники',
      value: totalMembers,
      description: 'Во всех организациях',
      icon: UserCheck,
    },
    {
      title: 'Заблокированные',
      value: bannedUsers,
      description: 'Пользователей',
      icon: Shield,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-muted-foreground text-xs">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
