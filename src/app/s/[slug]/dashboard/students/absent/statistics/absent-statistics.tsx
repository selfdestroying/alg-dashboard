'use client'

import * as React from 'react'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/src/components/ui/chart'
import { Tabs, TabsList, TabsTrigger } from '@/src/components/ui/tabs'
import { Ban, CircleDollarSign, ShieldCheck, TrendingDown } from 'lucide-react'

type TimeFrame = 'weekly' | 'monthly'
type ViewMode = 'count' | 'money'

interface ChartDataPoint {
  name: string
  missed: number
  saved: number
  missedMoney: number
  savedMoney: number
  lossMoney: number
}

interface AbsentStatisticsProps {
  averagePrice: number
  monthly: ChartDataPoint[]
  weekly: ChartDataPoint[]
  totalAbsences: number
  totalSaved: number
  makeupRate: number
  totalLostMoney: number
  totalSavedMoney: number
}

const chartConfig = {
  missed: { label: 'Пропущено', color: 'var(--destructive)' },
  saved: { label: 'Отработано', color: 'var(--success)' },
  missedMoney: { label: 'Потери (₽)', color: 'var(--destructive)' },
  savedMoney: { label: 'Возвращено (₽)', color: 'var(--success)' },
} satisfies ChartConfig

function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  variant?: 'default' | 'success' | 'destructive'
}) {
  const iconColors = {
    default: 'text-muted-foreground',
    success: 'text-emerald-500',
    destructive: 'text-red-500',
  }
  const bgColors = {
    default: 'bg-muted',
    success: 'bg-emerald-500/10',
    destructive: 'bg-red-500/10',
  }
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-1">
            <p className="text-muted-foreground text-xs font-medium">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {subtitle && <p className="text-muted-foreground text-xs">{subtitle}</p>}
          </div>
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${bgColors[variant]}`}
          >
            <Icon className={`h-4 w-4 ${iconColors[variant]}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AbsentStatistics({
  averagePrice,
  monthly,
  weekly,
  totalAbsences,
  totalSaved,
  makeupRate,
  totalLostMoney,
  totalSavedMoney,
}: AbsentStatisticsProps) {
  const [timeFrame, setTimeFrame] = React.useState<TimeFrame>('monthly')
  const [viewMode, setViewMode] = React.useState<ViewMode>('count')
  const chartData = timeFrame === 'monthly' ? monthly : weekly

  return (
    <div className="space-y-2">
      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <KpiCard
          title="Всего пропусков"
          value={totalAbsences}
          icon={Ban}
          subtitle={`средняя ставка: ${averagePrice.toLocaleString('ru-RU')} ₽`}
          variant="destructive"
        />
        <KpiCard
          title="Отработано"
          value={totalSaved}
          icon={ShieldCheck}
          subtitle={`${makeupRate}% от пропусков`}
          variant="success"
        />
        <KpiCard
          title="Потери"
          value={`${totalLostMoney.toLocaleString('ru-RU')} ₽`}
          icon={TrendingDown}
          subtitle="неотработанные пропуски"
          variant="destructive"
        />
        <KpiCard
          title="Возвращено"
          value={`${totalSavedMoney.toLocaleString('ru-RU')} ₽`}
          icon={CircleDollarSign}
          subtitle="через отработки"
          variant="success"
        />
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Динамика пропусков и отработок</CardTitle>
          <div className="flex items-center gap-2">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <TabsList className="h-7">
                <TabsTrigger value="count">Кол-во</TabsTrigger>
                <TabsTrigger value="money">Деньги</TabsTrigger>
              </TabsList>
            </Tabs>
            <Tabs value={timeFrame} onValueChange={(v) => setTimeFrame(v as TimeFrame)}>
              <TabsList className="h-7">
                <TabsTrigger value="monthly">Месяц</TabsTrigger>
                <TabsTrigger value="weekly">Неделя</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <ChartContainer config={chartConfig} className="h-48 w-full">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="fillMissed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--destructive)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--destructive)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fillSaved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--success)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10 }}
                tickMargin={4}
                minTickGap={32}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => value}
                    indicator="dot"
                    formatter={(value, name) => {
                      const isMoney = viewMode === 'money'
                      const valNum = Number(value)
                      return (
                        <div className="text-muted-foreground flex min-w-32.5 items-center gap-2 text-xs">
                          {chartConfig[name as keyof typeof chartConfig]?.label || name}
                          <div className="text-foreground ml-auto flex items-baseline gap-0.5 font-mono font-medium">
                            {isMoney ? valNum.toLocaleString('ru-RU') + ' ₽' : valNum}
                          </div>
                        </div>
                      )
                    }}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent payload={undefined} />} />
              <Area
                dataKey={viewMode === 'count' ? 'missed' : 'missedMoney'}
                type="monotone"
                fill="url(#fillMissed)"
                fillOpacity={0.4}
                stroke="var(--destructive)"
                strokeWidth={2}
              />
              <Area
                dataKey={viewMode === 'count' ? 'saved' : 'savedMoney'}
                type="monotone"
                fill="url(#fillSaved)"
                fillOpacity={0.4}
                stroke="var(--success)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
