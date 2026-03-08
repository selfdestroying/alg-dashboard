'use client'

import { SignOutButton } from '@/src/components/sign-out-button'
import { Button } from '@/src/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs'
import { RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import AdminStats from './admin-stats'
import MembersTable from './members-table'
import OrganizationsTable from './organizations-table'
import type { AdminDashboardData } from './types'
import UsersTable from './users-table'

export type { AdminDashboardData, AdminOrganization, AdminUser } from './types'

interface AdminDashboardProps {
  initialData: AdminDashboardData
}

export default function AdminDashboard({ initialData }: AdminDashboardProps) {
  const router = useRouter()
  const [isRefreshing, startRefresh] = useTransition()

  const handleRefresh = () => {
    startRefresh(() => {
      router.refresh()
    })
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Шапка */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Админ-панель</h1>
          <p className="text-muted-foreground text-sm">
            Управление пользователями, организациями и участниками
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`${isRefreshing ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
          <SignOutButton />
        </div>
      </div>

      {/* Статистика */}
      <AdminStats data={initialData} />

      {/* Вкладки */}
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Пользователи</TabsTrigger>
          <TabsTrigger value="organizations">Организации</TabsTrigger>
          <TabsTrigger value="members">Участники</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UsersTable data={initialData} onRefresh={handleRefresh} />
        </TabsContent>

        <TabsContent value="organizations">
          <OrganizationsTable data={initialData} onRefresh={handleRefresh} />
        </TabsContent>

        <TabsContent value="members">
          <MembersTable data={initialData} onRefresh={handleRefresh} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
