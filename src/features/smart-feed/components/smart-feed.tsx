'use client'

import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/src/components/ui/empty'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/src/components/ui/popover'
import { useSidebar } from '@/src/components/ui/sidebar'
import { Skeleton } from '@/src/components/ui/skeleton'
import { GlobalSearch } from '@/src/features/search/components/global-search'
import { moscowNow } from '@/src/lib/timezone'
import { cn } from '@/src/lib/utils'
import { Ban, Bell, Clock, CreditCard, Menu, SquareArrowOutUpRight, UserX } from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'
import { useAbsentStreaksQuery, useLowBalanceQuery, useUnmarkedAttendnace } from '../queries'
import { getSmartFeedAlertId, type SmartFeedAlert } from '../types'
import { FeedCard } from './feed-card'
import { QuickTip } from './quick-tip'

// ─── Popover-only trigger (mobile) ─────────────────────────────────────

export function SmartFeed() {
  const { data: unmarkedAlerts } = useUnmarkedAttendnace()
  const { data: lowBalanceAlerts } = useLowBalanceQuery()
  const { data: absentStreakAlerts } = useAbsentStreaksQuery()
  const count =
    (unmarkedAlerts?.length ?? 0) +
    (lowBalanceAlerts?.length ?? 0) +
    (absentStreakAlerts?.length ?? 0)
  const hasAlerts = count > 0

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      render={<Link href={'/smart-feed'} />}
      nativeButton={false}
    >
      <Bell className="size-3.5" />
      {hasAlerts && (
        <span className="bg-destructive text-destructive-foreground absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full text-[0.5rem] font-bold">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Button>
  )
}

// ─── Desktop info bar ──────────────────────────────────────────────────

export function SmartFeedBar({ canSeeFeed }: { canSeeFeed: boolean }) {
  const { isMobile, toggleSidebar } = useSidebar()
  const now = useMemo(() => moscowNow(), [])
  const greeting = getGreeting(now)

  return (
    <div className="flex w-full items-center gap-2">
      {/* Left: greeting */}
      <div className="flex h-full min-w-0 flex-1 items-center gap-2">
        <p className="text-muted-foreground truncate text-xs">{greeting}</p>
        <QuickTip />
      </div>

      {/* Center: global search */}
      <GlobalSearch />

      {/* Right: alerts / sidebar toggle */}
      <div className="flex flex-1 items-center justify-end gap-2">
        {canSeeFeed && !isMobile && (
          <div className="grid auto-cols-max grid-flow-col items-center gap-2">
            <UnmarkedAttendanceChip />
            <LowBalanceChip />
            <AbsentStreaksChip />
            <Button
              variant="outline"
              size="icon"
              render={<Link href="/smart-feed" />}
              nativeButton={false}
            >
              <SquareArrowOutUpRight />
            </Button>
          </div>
        )}
        {canSeeFeed && isMobile && (
          <>
            <SmartFeed />
            <SidebarToggle onClick={toggleSidebar} />
          </>
        )}
        {!canSeeFeed && isMobile && <SidebarToggle onClick={toggleSidebar} />}
      </div>
    </div>
  )
}

export function UnmarkedAttendanceChip() {
  const { data, isLoading, isError } = useUnmarkedAttendnace()

  return (
    <ChipPopover
      alerts={data ?? []}
      icon={<Clock />}
      title="Неотмеченные посещения"
      isLoading={isLoading}
      isError={isError}
      description="Группы, в которых не отмечены посещения"
    />
  )
}

export function LowBalanceChip() {
  const { data, isLoading, isError } = useLowBalanceQuery()
  return (
    <ChipPopover
      alerts={data ?? []}
      icon={<CreditCard />}
      title="Низкий баланс"
      isLoading={isLoading}
      isError={isError}
      description="Ученики с низким балансом в кошельке"
    />
  )
}

export function AbsentStreaksChip() {
  const { data, isLoading, isError } = useAbsentStreaksQuery()

  return (
    <ChipPopover
      alerts={data ?? []}
      icon={<UserX />}
      title="Риски"
      isLoading={isLoading}
      isError={isError}
      description="Ученики с 2 пропусками подряд"
    />
  )
}

function SidebarToggle({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" size="icon" onClick={onClick}>
      <Menu />
    </Button>
  )
}

// ─── Chip popover (desktop - one per alert type) ───────────────────────

const chipVariants = {
  red: 'bg-destructive/10 text-destructive hover:bg-destructive/15',
  orange: 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/15',
  yellow: 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/15',
  green: 'bg-green-500/10 text-green-600 hover:bg-green-500/15',
} as const

function getChipVariant(count: number): keyof typeof chipVariants {
  if (count === 0) return 'green'
  if (count <= 5) return 'yellow'
  if (count <= 10) return 'orange'
  return 'red'
}

function ChipPopover({
  icon,
  title,
  alerts,
  isLoading,
  isError,
  description: tooltipMessage,
}: {
  icon: React.ReactNode
  title: string
  description?: string
  alerts: SmartFeedAlert[]
  isLoading: boolean
  isError: boolean
}) {
  if (isLoading) {
    return <Skeleton className="h-full w-10" />
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Badge
            variant={'secondary'}
            className={cn(
              'h-full cursor-pointer rounded-md select-none',
              !isError && chipVariants[getChipVariant(alerts.length)],
            )}
          >
            {icon}
            {isError ? '-' : alerts.length}
          </Badge>
        }
        nativeButton={false}
      />
      <PopoverContent align="end">
        <PopoverHeader>
          <PopoverTitle>{title}</PopoverTitle>
          <PopoverDescription>{tooltipMessage}</PopoverDescription>
        </PopoverHeader>
        <div className="thin-scrollbar max-h-64 space-y-1 overflow-y-auto">
          {isError ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia>
                  <Ban />
                </EmptyMedia>
                <EmptyTitle>Ошибка загрузки</EmptyTitle>
                <EmptyDescription>
                  Произошла ошибка при загрузке модуля. Попробуйте обновить страницу.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            alerts.map((alert) => <FeedCard key={getSmartFeedAlertId(alert)} alert={alert} />)
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ─── Helpers ───────────────────────────────────────────────────────────

function getGreeting(date: Date): string {
  const h = date.getHours()
  if (h < 6) return 'Доброй ночи'
  if (h < 12) return 'Доброе утро'
  if (h < 18) return 'Добрый день'
  return 'Добрый вечер'
}
