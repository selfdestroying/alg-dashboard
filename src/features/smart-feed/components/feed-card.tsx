'use client'

import { Button } from '@/src/components/ui/button'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/src/components/ui/item'
import { dateOnlyToLocal } from '@/src/lib/timezone'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { ArrowRight, Clock, CreditCard, TrendingDown, UserX } from 'lucide-react'
import Link from 'next/link'
import { useSnoozeAlertMutation } from '../queries'
import { ALERT_TYPE, type SmartFeedAlert } from '../types'

interface FeedCardProps {
  alert: SmartFeedAlert
}

export function FeedCard({ alert }: FeedCardProps) {
  switch (alert.type) {
    case ALERT_TYPE.UNMARKED_ATTENDANCE:
      return <UnmarkedAttendanceCard alert={alert} />
    case ALERT_TYPE.LOW_BALANCE:
      return <LowBalanceCard alert={alert} />
    case ALERT_TYPE.NEGATIVE_BALANCE:
      return <NegativeBalanceCard alert={alert} />
    case ALERT_TYPE.CONSECUTIVE_ABSENCES:
      return <ConsecutiveAbsencesCard alert={alert} />
  }
}

function UnmarkedAttendanceCard({
  alert,
}: {
  alert: SmartFeedAlert & { type: 'UNMARKED_ATTENDANCE' }
}) {
  const formattedDate = format(dateOnlyToLocal(alert.lessonDate), 'd MMM', { locale: ru })

  return (
    <Item size={'xs'}>
      <ItemMedia variant="icon">
        <Clock className="text-destructive" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{alert.groupName}</ItemTitle>
        <ItemDescription>
          {formattedDate}, {alert.lessonTime} · {alert.unspecifiedCount} неотмечен.
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Link href={`/lessons/${alert.lessonId}`}>
          <Button variant="outline" size={'icon'}>
            <ArrowRight />
          </Button>
        </Link>
      </ItemActions>
    </Item>
  )
}

function NegativeBalanceCard({ alert }: { alert: SmartFeedAlert & { type: 'NEGATIVE_BALANCE' } }) {
  const snoozeMutation = useSnoozeAlertMutation()

  return (
    <Item size={'xs'}>
      <ItemMedia variant="icon">
        <TrendingDown className="text-destructive" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{alert.groupName}</ItemTitle>
        <ItemDescription>
          {alert.groupName} ·{' '}
          <span className="text-destructive">
            {alert.lessonsBalance} {declLessons(alert.lessonsBalance)}
          </span>
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button
          variant="outline"
          size={'icon'}
          onClick={() =>
            snoozeMutation.mutate({
              alertType: alert.type,
              entityKey: `wallet:${alert.walletId}`,
              snoozeDays: 2,
            })
          }
          disabled={snoozeMutation.isPending}
          title="Отложить на 2 дня"
        >
          <Clock />
        </Button>
        <Link href={`/students/${alert.studentId}`}>
          <Button variant="outline" size={'icon'}>
            <ArrowRight />
          </Button>
        </Link>
      </ItemActions>
    </Item>
  )
}

function LowBalanceCard({ alert }: { alert: SmartFeedAlert & { type: 'LOW_BALANCE' } }) {
  const snoozeMutation = useSnoozeAlertMutation()

  return (
    <Item size={'xs'}>
      <ItemMedia variant="icon">
        <CreditCard className="text-yellow-600" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{alert.studentName}</ItemTitle>
        <ItemDescription>
          {alert.groupName} · остался {alert.lessonsBalance} урок
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button
          variant="outline"
          size={'icon'}
          onClick={() =>
            snoozeMutation.mutate({
              alertType: alert.type,
              entityKey: `wallet:${alert.walletId}`,
              snoozeDays: 2,
            })
          }
          disabled={snoozeMutation.isPending}
          title="Отложить на 2 дня"
        >
          <Clock />
        </Button>
        <Link href={`/students/${alert.studentId}`}>
          <Button variant="outline" size={'icon'}>
            <ArrowRight />
          </Button>
        </Link>
      </ItemActions>
    </Item>
  )
}

function ConsecutiveAbsencesCard({
  alert,
}: {
  alert: SmartFeedAlert & { type: 'CONSECUTIVE_ABSENCES' }
}) {
  return (
    <Item size={'xs'} render={<Link href={`/students/${alert.studentId}`} />}>
      <ItemMedia variant="icon">
        <UserX className="text-orange-500" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{alert.studentName}</ItemTitle>
        <ItemDescription>
          {alert.groupName} · {alert.absenceCount} пропуска подряд
        </ItemDescription>
      </ItemContent>
    </Item>
  )
}

function declLessons(n: number): string {
  const abs = Math.abs(n)
  if (abs % 10 === 1 && abs % 100 !== 11) return 'занятие'
  if (abs % 10 >= 2 && abs % 10 <= 4 && (abs % 100 < 10 || abs % 100 >= 20)) return 'занятия'
  return 'занятий'
}
