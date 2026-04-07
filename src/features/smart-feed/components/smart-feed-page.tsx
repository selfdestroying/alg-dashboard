'use client'

import TableFilter, { type TableFilterItem } from '@/src/components/table-filter'
import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { FieldGroup } from '@/src/components/ui/field'
import { Skeleton } from '@/src/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/src/components/ui/tabs'
import { cn } from '@/src/lib/utils'
import { Clock, CreditCard, TrendingDown, UserX } from 'lucide-react'
import { parseAsArrayOf, parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs'
import { useMemo } from 'react'
import {
  useRestoreSnoozedAlertMutation,
  useSmartFeedPageQuery,
  useSnoozeAlertMutation,
} from '../queries'
import {
  ALERT_SEVERITY_LABELS,
  ALERT_SEVERITY_VALUES,
  ALERT_TYPE,
  ALERT_TYPE_LABELS,
  ALERT_TYPE_VALUES,
  isAlertSeverity,
  isAlertType,
  SMART_FEED_STATUS,
  SMART_FEED_TAB_VALUES,
  type AlertSeverity,
  type AlertType,
  type SmartFeedPageAlert,
  type SmartFeedTab,
} from '../types'
import { SmartFeedDetailCard } from './smart-feed-detail-card'

const QUERY_STATES_OPTIONS = { shallow: true, history: 'replace' as const }

const PAGE_PARSERS = {
  tab: parseAsStringLiteral(SMART_FEED_TAB_VALUES).withDefault(SMART_FEED_STATUS.ACTIVE),
  type: parseAsArrayOf(parseAsString).withDefault([]),
  severity: parseAsArrayOf(parseAsString).withDefault([]),
}

const TYPE_FILTER_ITEMS: TableFilterItem[] = ALERT_TYPE_VALUES.map((type) => ({
  value: type,
  label: ALERT_TYPE_LABELS[type],
}))

const SEVERITY_FILTER_ITEMS: TableFilterItem[] = ALERT_SEVERITY_VALUES.map((severity) => ({
  value: severity,
  label: ALERT_SEVERITY_LABELS[severity],
}))

const SUMMARY_VISUALS = {
  [ALERT_TYPE.UNMARKED_ATTENDANCE]: {
    icon: Clock,
    className: 'bg-destructive/10 text-destructive',
  },
  [ALERT_TYPE.NEGATIVE_BALANCE]: {
    icon: TrendingDown,
    className: 'bg-destructive/10 text-destructive',
  },
  [ALERT_TYPE.LOW_BALANCE]: {
    icon: CreditCard,
    className: 'bg-yellow-500/10 text-yellow-600',
  },
  [ALERT_TYPE.CONSECUTIVE_ABSENCES]: {
    icon: UserX,
    className: 'bg-orange-500/10 text-orange-600',
  },
} as const

export default function SmartFeedPage() {
  const { data, isLoading, isError } = useSmartFeedPageQuery()
  const [pageState, setPageState] = useQueryStates(PAGE_PARSERS, QUERY_STATES_OPTIONS)

  const selectedTypes = useMemo(() => pageState.type.filter(isAlertType), [pageState.type])
  const selectedSeverities = useMemo(
    () => pageState.severity.filter(isAlertSeverity),
    [pageState.severity],
  )

  const selectedTypeItems = useMemo(
    () => TYPE_FILTER_ITEMS.filter((item) => selectedTypes.includes(item.value as AlertType)),
    [selectedTypes],
  )
  const selectedSeverityItems = useMemo(
    () =>
      SEVERITY_FILTER_ITEMS.filter((item) =>
        selectedSeverities.includes(item.value as AlertSeverity),
      ),
    [selectedSeverities],
  )

  const snoozeMutation = useSnoozeAlertMutation()
  const restoreMutation = useRestoreSnoozedAlertMutation()

  const pendingAlertId = useMemo(() => {
    if (snoozeMutation.isPending && snoozeMutation.variables) {
      return `${snoozeMutation.variables.alertType}:${snoozeMutation.variables.entityKey}`
    }

    if (restoreMutation.isPending && restoreMutation.variables) {
      return `${restoreMutation.variables.alertType}:${restoreMutation.variables.entityKey}`
    }

    return null
  }, [
    restoreMutation.isPending,
    restoreMutation.variables,
    snoozeMutation.isPending,
    snoozeMutation.variables,
  ])

  const hasCustomFilters = selectedTypes.length > 0 || selectedSeverities.length > 0

  const activeCount = data?.active.length ?? 0
  const snoozedCount = data?.snoozed.length ?? 0
  const currentAlerts =
    pageState.tab === SMART_FEED_STATUS.SNOOZED ? (data?.snoozed ?? []) : (data?.active ?? [])

  const handleTabChange = (value: string) => {
    if (!SMART_FEED_TAB_VALUES.includes(value as SmartFeedTab)) return
    setPageState({
      tab: value === SMART_FEED_STATUS.ACTIVE ? null : (value as SmartFeedTab),
    })
  }

  const handleTypeChange = (items: TableFilterItem[]) => {
    setPageState({ type: items.length > 0 ? items.map((item) => item.value) : null })
  }

  const handleSeverityChange = (items: TableFilterItem[]) => {
    setPageState({ severity: items.length > 0 ? items.map((item) => item.value) : null })
  }

  const handleResetFilters = () => {
    setPageState({
      type: null,
      severity: null,
    })
  }

  const handleSnooze = (alert: SmartFeedPageAlert) => {
    snoozeMutation.mutate({
      alertType: alert.type,
      entityKey: alert.entityKey,
      snoozeDays: 2,
    })
  }

  const handleRestore = (alert: SmartFeedPageAlert) => {
    restoreMutation.mutate({
      alertType: alert.type,
      entityKey: alert.entityKey,
    })
  }

  if (isLoading) {
    return <SmartFeedPageSkeleton />
  }

  if (isError || !data) {
    return <div className="text-destructive">Не удалось загрузить Smart Feed.</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 xl:flex-row xl:items-end xl:justify-between">
        <Tabs value={pageState.tab} onValueChange={handleTabChange}>
          <TabsList className={'w-full'}>
            <TabsTrigger value={SMART_FEED_STATUS.ACTIVE}>
              Активные
              <Badge variant="secondary">{activeCount}</Badge>
            </TabsTrigger>
            <TabsTrigger value={SMART_FEED_STATUS.SNOOZED}>
              Отложенные
              <Badge variant="secondary">{snoozedCount}</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap items-center gap-2">
          {hasCustomFilters && (
            <Button variant="ghost" size="sm" onClick={handleResetFilters}>
              Сбросить фильтры
            </Button>
          )}
        </div>
      </div>

      <FieldGroup className="grid gap-3 md:grid-cols-2 xl:grid-cols-2">
        <TableFilter
          label="Тип"
          items={TYPE_FILTER_ITEMS}
          value={selectedTypeItems}
          onChange={handleTypeChange}
        />

        <TableFilter
          label="Важность"
          items={SEVERITY_FILTER_ITEMS}
          value={selectedSeverityItems}
          onChange={handleSeverityChange}
        />
      </FieldGroup>

      <SmartFeedResults
        alerts={currentAlerts}
        tab={pageState.tab}
        selectedTypes={selectedTypes}
        selectedSeverities={selectedSeverities}
        hasCustomFilters={hasCustomFilters}
        pendingAlertId={pendingAlertId}
        onSnooze={handleSnooze}
        onRestore={handleRestore}
      />
    </div>
  )
}

function SmartFeedResults({
  alerts,
  tab,
  selectedTypes,
  selectedSeverities,
  hasCustomFilters,
  pendingAlertId,
  onSnooze,
  onRestore,
}: {
  alerts: SmartFeedPageAlert[]
  tab: SmartFeedTab
  selectedTypes: AlertType[]
  selectedSeverities: AlertSeverity[]
  hasCustomFilters: boolean
  pendingAlertId: string | null
  onSnooze: (alert: SmartFeedPageAlert) => void
  onRestore: (alert: SmartFeedPageAlert) => void
}) {
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      if (selectedTypes.length > 0 && !selectedTypes.includes(alert.type)) return false
      if (selectedSeverities.length > 0 && !selectedSeverities.includes(alert.severity))
        return false
      return true
    })
  }, [alerts, selectedSeverities, selectedTypes])

  const summary = useMemo(
    () =>
      ALERT_TYPE_VALUES.map((type) => ({
        type,
        count: filteredAlerts.filter((alert) => alert.type === type).length,
      })),
    [filteredAlerts],
  )

  return (
    <div className="space-y-4">
      <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-xs">
        <p>
          Показано {filteredAlerts.length} из {alerts.length}
        </p>
        {tab === SMART_FEED_STATUS.SNOOZED && alerts.length > 0 && (
          <p>Отложенные сигналы скрыты из шапки до указанного времени.</p>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map(({ type, count }) => {
          const Icon = SUMMARY_VISUALS[type].icon

          return (
            <div key={type} className="ring-foreground/10 bg-muted/20 rounded-lg p-3 ring-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-muted-foreground text-[0.7rem]">{ALERT_TYPE_LABELS[type]}</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums">{count}</p>
                </div>
                <div
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-md',
                    SUMMARY_VISUALS[type].className,
                  )}
                >
                  <Icon className="size-4" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredAlerts.length === 0 ? (
        <div className="ring-foreground/10 bg-muted/20 rounded-lg p-6 text-center ring-1">
          <p className="text-sm font-medium">
            {alerts.length === 0
              ? tab === SMART_FEED_STATUS.ACTIVE
                ? 'Сейчас нет активных уведомлений.'
                : 'Сейчас нет отложенных уведомлений.'
              : 'По текущим фильтрам ничего не найдено.'}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            {alerts.length === 0
              ? tab === SMART_FEED_STATUS.ACTIVE
                ? 'Smart Feed пуст и не требует действий.'
                : 'Все сигналы уже вернулись в активные или были решены.'
              : hasCustomFilters
                ? 'Сбросьте часть фильтров и попробуйте снова.'
                : 'Измените набор фильтров и попробуйте снова.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAlerts.map((alert) => (
            <SmartFeedDetailCard
              key={alert.id}
              alert={alert}
              isPending={pendingAlertId === alert.id}
              onSnooze={onSnooze}
              onRestore={onRestore}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function SmartFeedPageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-7 w-28" />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    </div>
  )
}
