'use client'

import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/src/components/ui/popover'
import { Separator } from '@/src/components/ui/separator'
import { useSidebar } from '@/src/components/ui/sidebar'
import { Skeleton } from '@/src/components/ui/skeleton'
import { GlobalSearch } from '@/src/features/search/components/global-search'
import { moscowNow } from '@/src/lib/timezone'
import { cn } from '@/src/lib/utils'
import {
  Bell,
  CheckCircle2,
  Clock,
  CreditCard,
  Menu,
  SquareArrowOutUpRight,
  TrendingDown,
  UserX,
} from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'
import { useSmartFeedQuery } from '../queries'
import { ALERT_TYPE, getSmartFeedAlertId, type SmartFeedAlert } from '../types'
import { FeedCard } from './feed-card'
import { QuickTip } from './quick-tip'

// ─── Popover-only trigger (mobile) ─────────────────────────────────────

export function SmartFeed() {
  const { data: alerts } = useSmartFeedQuery()
  const count = alerts?.length ?? 0
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
  const { data: alerts, isLoading } = useSmartFeedQuery()
  const { isMobile, toggleSidebar } = useSidebar()
  const now = useMemo(() => moscowNow(), [])
  const greeting = getGreeting(now)

  const chips = useMemo(() => buildChips(alerts), [alerts])

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
        {canSeeFeed && !isMobile && <DesktopAlerts isLoading={isLoading} chips={chips} />}
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

// ─── Desktop alerts ────────────────────────────────────────────────────

type ChipConfig = {
  key: string
  icon: React.ReactNode
  label: string
  title: string
  variant: keyof typeof chipVariants
  alerts: SmartFeedAlert[]
}

function DesktopAlerts({ isLoading, chips }: { isLoading: boolean; chips: ChipConfig[] }) {
  return (
    <div className="grid auto-cols-max grid-flow-col items-center gap-2">
      {isLoading ? (
        Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-full w-20" />)
      ) : chips.length === 0 ? (
        <Badge className={cn('h-full rounded-md select-none', chipVariants.green)}>
          <CheckCircle2 className="size-3" />
          <span>Всё ок</span>
        </Badge>
      ) : (
        chips.map((c) => (
          <ChipPopover
            key={c.key}
            icon={c.icon}
            count={c.alerts.length}
            label={c.label}
            title={c.title}
            variant={c.variant}
            alerts={c.alerts}
          />
        ))
      )}
      <Button
        variant="outline"
        size="icon"
        render={<Link href="/smart-feed" />}
        nativeButton={false}
      >
        <SquareArrowOutUpRight />
      </Button>
    </div>
  )
}

function SidebarToggle({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" size="icon" onClick={onClick}>
      <Menu />
    </Button>
  )
}

function buildChips(alerts: SmartFeedAlert[] | undefined): ChipConfig[] {
  if (!alerts?.length) return []
  const unmarked = alerts.filter((a) => a.type === ALERT_TYPE.UNMARKED_ATTENDANCE)
  const debts = alerts.filter((a) => a.type === ALERT_TYPE.NEGATIVE_BALANCE)
  const low = alerts.filter((a) => a.type === ALERT_TYPE.LOW_BALANCE)
  const absences = alerts.filter((a) => a.type === ALERT_TYPE.CONSECUTIVE_ABSENCES)

  const defs: ChipConfig[] = [
    {
      key: 'unmarked',
      icon: <Clock className="size-2.5" />,
      label: 'неотмечен.',
      title: 'Посещаемость',
      variant: 'red',
      alerts: unmarked,
    },
    {
      key: 'debts',
      icon: <TrendingDown className="size-2.5" />,
      label: declPlural(debts.length, 'долг', 'долга', 'долгов'),
      title: 'Долги',
      variant: 'red',
      alerts: debts,
    },
    {
      key: 'low',
      icon: <CreditCard className="size-2.5" />,
      label: 'оплата',
      title: 'Заканчивается баланс',
      variant: 'yellow',
      alerts: low,
    },
    {
      key: 'absences',
      icon: <UserX className="size-2.5" />,
      label: declPlural(absences.length, 'риск', 'риска', 'рисков'),
      title: 'Зона риска',
      variant: 'orange',
      alerts: absences,
    },
  ]

  return defs.filter((d) => d.alerts.length > 0)
}

// ─── Chip popover (desktop - one per alert type) ───────────────────────

const chipVariants = {
  red: 'bg-destructive/10 text-destructive hover:bg-destructive/15',
  orange: 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/15',
  yellow: 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/15',
  green: 'bg-green-500/10 text-green-600 hover:bg-green-500/15',
} as const

function ChipPopover({
  icon,
  count,
  label,
  title,
  variant,
  alerts,
}: {
  icon: React.ReactNode
  count: number
  label: string
  title: string
  variant: keyof typeof chipVariants
  alerts: SmartFeedAlert[]
}) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Badge
            className={cn('h-full cursor-pointer rounded-md select-none', chipVariants[variant])}
          />
        }
        nativeButton={false}
      >
        {icon}
        {count} {label}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-max">
        <PopoverHeader>
          <PopoverTitle>{title}</PopoverTitle>
        </PopoverHeader>
        <Separator />
        <div className="thin-scrollbar max-h-64 space-y-2 overflow-y-auto">
          {alerts.map((alert) => (
            <FeedCard key={getSmartFeedAlertId(alert)} alert={alert} />
          ))}
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

function declPlural(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n) % 100
  const lastDigit = abs % 10
  if (abs > 10 && abs < 20) return many
  if (lastDigit === 1) return one
  if (lastDigit >= 2 && lastDigit <= 4) return few
  return many
}
