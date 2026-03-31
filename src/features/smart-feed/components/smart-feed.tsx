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
import { Bell, CheckCircle2, Clock, CreditCard, TrendingDown, UserX } from 'lucide-react'
import { useMemo } from 'react'
import { useSmartFeedQuery } from '../queries'
import { ALERT_TYPE, type SmartFeedAlert } from '../types'
import { FeedCard } from './feed-card'

// ─── Popover-only trigger (mobile) ─────────────────────────────────────

export function SmartFeed() {
  const { data: alerts, isLoading } = useSmartFeedQuery()
  const count = alerts?.length ?? 0
  const hasAlerts = count > 0

  return (
    <Popover>
      <PopoverTrigger render={<Button variant="ghost" size="icon" className="relative" />}>
        <Bell className="size-3.5" />
        {hasAlerts && (
          <span className="bg-destructive text-destructive-foreground absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full text-[0.5rem] font-bold">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </PopoverTrigger>
      <FeedPopoverContent alerts={alerts} isLoading={isLoading} hasAlerts={hasAlerts} />
    </Popover>
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
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground truncate text-xs">
          {greeting} · <span className="capitalize">{dateStr}</span>
        </p>
      </div>

      {/* Alert chip-popovers */}
      <div className="flex items-center gap-1.5">
        {isLoading ? (
          <Skeleton className="h-5 w-32" />
        ) : !hasAlerts ? (
          <div className="text-success flex items-center gap-1 text-[0.625rem]">
            <CheckCircle2 className="size-3" />
            <span>Всё ок</span>
          </div>
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
      </div>
    </div>
  )
}

// ─── Shared popover content (used by mobile SmartFeed) ─────────────────

function FeedPopoverContent({
  alerts,
  isLoading,
  hasAlerts,
}: {
  alerts: SmartFeedAlert[] | undefined
  isLoading: boolean
  hasAlerts: boolean
}) {
  return (
    <PopoverContent align="end">
      <PopoverHeader>
        <PopoverTitle>Центр внимания</PopoverTitle>
      </PopoverHeader>
      <Separator />
      <div className="thin-scrollbar max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2 p-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : !hasAlerts ? (
          <div className="flex items-center gap-2 px-3 py-4">
            <CheckCircle2 className="text-success size-4 shrink-0" />
            <p className="text-muted-foreground text-xs">Нет задач, требующих внимания</p>
          </div>
        ) : (
          <AlertGroups alerts={alerts!} />
        )}
      </div>
    </PopoverContent>
  )
}

// ─── Chip popover (desktop — one per alert type) ───────────────────────

const chipVariants = {
  red: 'bg-destructive/10 text-destructive hover:bg-destructive/15',
  orange: 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/15',
  yellow: 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/15',
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
        render={<Badge className={cn('cursor-pointer select-none', chipVariants[variant])} />}
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
            <FeedCard key={getAlertKey(alert)} alert={alert} />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ─── Alert groups (popover body) ───────────────────────────────────────

function AlertGroups({ alerts }: { alerts: SmartFeedAlert[] }) {
  const unmarked = alerts.filter((a) => a.type === ALERT_TYPE.UNMARKED_ATTENDANCE)
  const debts = alerts.filter((a) => a.type === ALERT_TYPE.NEGATIVE_BALANCE)
  const low = alerts.filter((a) => a.type === ALERT_TYPE.LOW_BALANCE)
  const absences = alerts.filter((a) => a.type === ALERT_TYPE.CONSECUTIVE_ABSENCES)

  return (
    <>
      {unmarked.length > 0 && <AlertSection label="Посещаемость" alerts={unmarked} />}
      {debts.length > 0 && <AlertSection label="Долги" alerts={debts} />}
      {low.length > 0 && <AlertSection label="Заканчивается баланс" alerts={low} />}
      {absences.length > 0 && <AlertSection label="Зона риска" alerts={absences} />}
    </>
  )
}

function AlertSection({ label, alerts }: { label: string; alerts: SmartFeedAlert[] }) {
  return (
    <div>
      <p className="text-muted-foreground px-3 pt-2 pb-1 text-[0.625rem] font-medium tracking-wider uppercase">
        {label}
        <span className="ml-1 opacity-60">({alerts.length})</span>
      </p>
      {alerts.map((alert) => (
        <FeedCard key={getAlertKey(alert)} alert={alert} />
      ))}
    </div>
  )
}

function getAlertKey(alert: SmartFeedAlert): string {
  switch (alert.type) {
    case 'UNMARKED_ATTENDANCE':
      return `att-${alert.lessonId}`
    case 'LOW_BALANCE':
      return `low-${alert.walletId}`
    case 'NEGATIVE_BALANCE':
      return `neg-${alert.walletId}`
    case 'CONSECUTIVE_ABSENCES':
      return `abs-${alert.studentId}-${alert.groupId}`
    default:
      return `unknown-${Math.random()}`
  }
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
