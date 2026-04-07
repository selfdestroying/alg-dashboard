'use client'

import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { dateOnlyToLocal, formatMoscow } from '@/src/lib/timezone'
import { cn } from '@/src/lib/utils'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { ArrowRight, Clock, CreditCard, RotateCcw, TrendingDown, UserX } from 'lucide-react'
import Link from 'next/link'
import {
  ALERT_SEVERITY_LABELS,
  ALERT_TYPE,
  ALERT_TYPE_LABELS,
  getSmartFeedAlertHref,
  getSmartFeedAlertTitle,
  isSmartFeedAlertSnoozable,
  type SmartFeedPageAlert,
} from '../types'

interface SmartFeedDetailCardProps {
  alert: SmartFeedPageAlert
  isPending?: boolean
  onSnooze: (alert: SmartFeedPageAlert) => void
  onRestore: (alert: SmartFeedPageAlert) => void
}

const severityBadgeClassNames = {
  red: 'bg-destructive/10 text-destructive',
  orange: 'bg-orange-500/10 text-orange-600',
  yellow: 'bg-yellow-500/10 text-yellow-600',
} as const

const typeVisuals = {
  [ALERT_TYPE.UNMARKED_ATTENDANCE]: {
    icon: Clock,
    iconClassName: 'text-destructive',
    wrapperClassName: 'bg-destructive/10',
  },
  [ALERT_TYPE.NEGATIVE_BALANCE]: {
    icon: TrendingDown,
    iconClassName: 'text-destructive',
    wrapperClassName: 'bg-destructive/10',
  },
  [ALERT_TYPE.LOW_BALANCE]: {
    icon: CreditCard,
    iconClassName: 'text-yellow-600',
    wrapperClassName: 'bg-yellow-500/10',
  },
  [ALERT_TYPE.CONSECUTIVE_ABSENCES]: {
    icon: UserX,
    iconClassName: 'text-orange-600',
    wrapperClassName: 'bg-orange-500/10',
  },
} as const

export function SmartFeedDetailCard({
  alert,
  isPending = false,
  onSnooze,
  onRestore,
}: SmartFeedDetailCardProps) {
  const Icon = typeVisuals[alert.type].icon

  return (
    <div className="ring-foreground/10 bg-muted/20 space-y-3 rounded-lg p-3 ring-1">
      <div className="flex gap-3">
        <div
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-lg',
            typeVisuals[alert.type].wrapperClassName,
          )}
        >
          <Icon className={cn('size-4', typeVisuals[alert.type].iconClassName)} />
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 space-y-1">
              <p className="truncate text-sm font-medium">{getSmartFeedAlertTitle(alert)}</p>
              <p className="text-muted-foreground text-xs/relaxed">{getAlertDescription(alert)}</p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <Badge variant="secondary">{ALERT_TYPE_LABELS[alert.type]}</Badge>
              <Badge className={severityBadgeClassNames[alert.severity]}>
                {ALERT_SEVERITY_LABELS[alert.severity]}
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-muted-foreground text-[0.7rem]">
              {alert.snoozedUntil
                ? `Отложено до ${formatMoscow(alert.snoozedUntil, 'd MMMM, HH:mm', { locale: ru })}`
                : 'Сигнал активен и учитывается в шапке'}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {!alert.snoozedUntil && isSmartFeedAlertSnoozable(alert) && (
                <Button
                  size={'icon'}
                  variant="outline"
                  onClick={() => onSnooze(alert)}
                  disabled={isPending}
                >
                  <Clock />
                </Button>
              )}

              {alert.snoozedUntil && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onRestore(alert)}
                  disabled={isPending}
                >
                  <RotateCcw />
                </Button>
              )}

              <Button
                variant="outline"
                size="icon"
                render={<Link href={getSmartFeedAlertHref(alert)} />}
                nativeButton={false}
              >
                <ArrowRight />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getAlertDescription(alert: SmartFeedPageAlert): string {
  switch (alert.type) {
    case ALERT_TYPE.UNMARKED_ATTENDANCE: {
      const formattedDate = format(dateOnlyToLocal(alert.lessonDate), 'd MMMM', { locale: ru })
      return `${formattedDate}, ${alert.lessonTime} · ${alert.unspecifiedCount} без отметки`
    }
    case ALERT_TYPE.NEGATIVE_BALANCE:
      return `${alert.groupName} · баланс ${alert.lessonsBalance} ${declLessons(alert.lessonsBalance)}`
    case ALERT_TYPE.LOW_BALANCE:
      return `${alert.groupName} · остался ${alert.lessonsBalance} ${declLessons(alert.lessonsBalance)}`
    case ALERT_TYPE.CONSECUTIVE_ABSENCES:
      return `${alert.groupName} · ${alert.absenceCount} пропуска подряд`
  }
}

function declLessons(n: number): string {
  const abs = Math.abs(n)
  if (abs % 10 === 1 && abs % 100 !== 11) return 'занятие'
  if (abs % 10 >= 2 && abs % 10 <= 4 && (abs % 100 < 10 || abs % 100 >= 20)) return 'занятия'
  return 'занятий'
}
