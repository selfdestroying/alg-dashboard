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
import { Skeleton } from '@/src/components/ui/skeleton'
import { moscowNow } from '@/src/lib/timezone'
import { cn } from '@/src/lib/utils'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import {
  Bell,
  CheckCircle2,
  Clock,
  CreditCard,
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

export function SmartFeedBar() {
  const { data: alerts, isLoading } = useSmartFeedQuery()

  const now = useMemo(() => moscowNow(), [])
  const dateStr = format(now, 'd MMMM, EEEE', { locale: ru })
  const greeting = getGreeting(now)

  const groups = useMemo(() => {
    if (!alerts) return null
    return {
      unmarked: alerts.filter((a) => a.type === ALERT_TYPE.UNMARKED_ATTENDANCE),
      debts: alerts.filter((a) => a.type === ALERT_TYPE.NEGATIVE_BALANCE),
      low: alerts.filter((a) => a.type === ALERT_TYPE.LOW_BALANCE),
      absences: alerts.filter((a) => a.type === ALERT_TYPE.CONSECUTIVE_ABSENCES),
    }
  }, [alerts])

  const hasAlerts = (alerts?.length ?? 0) > 0

  return (
    <div className="flex items-center gap-2">
      {/* Date & greeting */}
      <div className="flex h-full min-w-0 flex-1 items-center gap-2">
        <p className="text-muted-foreground truncate text-xs">
          {greeting} · <span className="capitalize">{dateStr}</span>
        </p>
        <QuickTip />
      </div>

      {/* Alert chip-popovers */}
      <div className="grid auto-cols-max grid-flow-col items-center gap-2">
        {isLoading ? (
          <>
            <Skeleton className="h-full w-20" />
            <Skeleton className="h-full w-20" />
            <Skeleton className="h-full w-20" />
            <Skeleton className="h-full w-20" />
          </>
        ) : !hasAlerts ? (
          <Badge className={cn('h-full rounded-md select-none', chipVariants.green)}>
            <CheckCircle2 className="size-3" />
            <span>Всё ок</span>
          </Badge>
        ) : (
          <>
            {groups!.unmarked.length > 0 && (
              <ChipPopover
                icon={<Clock className="size-2.5" />}
                count={groups!.unmarked.length}
                label="неотмечен."
                title="Посещаемость"
                variant="red"
                alerts={groups!.unmarked}
              />
            )}
            {groups!.debts.length > 0 && (
              <ChipPopover
                icon={<TrendingDown className="size-2.5" />}
                count={groups!.debts.length}
                label={declPlural(groups!.debts.length, 'долг', 'долга', 'долгов')}
                title="Долги"
                variant="red"
                alerts={groups!.debts}
              />
            )}
            {groups!.low.length > 0 && (
              <ChipPopover
                icon={<CreditCard className="size-2.5" />}
                count={groups!.low.length}
                label="оплата"
                title="Заканчивается баланс"
                variant="yellow"
                alerts={groups!.low}
              />
            )}
            {groups!.absences.length > 0 && (
              <ChipPopover
                icon={<UserX className="size-2.5" />}
                count={groups!.absences.length}
                label={declPlural(groups!.absences.length, 'риск', 'риска', 'рисков')}
                title="Зона риска"
                variant="orange"
                alerts={groups!.absences}
              />
            )}
          </>
        )}
        <Button
          variant={'outline'}
          size={'icon'}
          render={<Link href={'/smart-feed'} />}
          nativeButton={false}
        >
          <SquareArrowOutUpRight />
        </Button>
      </div>
    </div>
  )
}

// ─── Chip popover (desktop — one per alert type) ───────────────────────

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
