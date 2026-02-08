'use client'

import * as React from 'react'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/src/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/src/components/ui/tabs'

export const description = 'An area chart with gradient and filtering'

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
}

const chartConfig = {
  missed: {
    label: 'Пропущено',
    color: 'var(--destructive)', // Red-ish ideally
  },
  saved: {
    label: 'Спасено',
    color: 'var(--success)', // Green-ish ideally
  },
  missedMoney: {
    label: 'Пропущено (₽)',
    color: 'var(--destructive)', // Red-ish ideally
  },
  savedMoney: {
    label: 'Спасено (₽)',
    color: 'var(--success)', // Green-ish ideally
  },
} satisfies ChartConfig

export default function AbsentStatistics({ averagePrice, monthly, weekly }: AbsentStatisticsProps) {
  const [timeFrame, setTimeFrame] = React.useState<TimeFrame>('monthly')
  const [viewMode, setViewMode] = React.useState<ViewMode>('count')

  const chartData = timeFrame === 'monthly' ? monthly : weekly

  return (
    <Card>
      <CardHeader className="">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Динамика пропусков и отработок</CardTitle>
          <CardDescription>
            Анализ пропущенных уроков и возврат средств через отработки
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList>
              <TabsTrigger value="count">Кол-во</TabsTrigger>
              <TabsTrigger value="money">Деньги</TabsTrigger>
            </TabsList>
          </Tabs>
          <Select
            value={timeFrame}
            onValueChange={(value) => setTimeFrame(value as TimeFrame)}
            itemToStringLabel={(itemValue) =>
              itemValue === 'monthly' ? 'По месяцам' : 'По неделям'
            }
          >
            <SelectTrigger aria-label="Выберите период">
              <SelectValue placeholder="Период" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="weekly">По неделям</SelectItem>
                <SelectItem value="monthly">По месяцам</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-62.5 w-full">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillMissed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--destructive)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--destructive)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillSaved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--success)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--success)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
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
              type="natural"
              fill="url(#fillMissed)"
              fillOpacity={0.4}
              stroke="var(--destructive)" // Red
              stackId="a"
            />
            <Area
              dataKey={viewMode === 'count' ? 'saved' : 'savedMoney'}
              type="natural"
              fill="url(#fillSaved)"
              fillOpacity={0.4}
              stroke="var(--success)" // Green
              stackId="b"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
