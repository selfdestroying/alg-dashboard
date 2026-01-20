'use client'

import { CartesianGrid, LabelList, Line, LineChart, XAxis } from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'

interface ChartData {
  month: string
  count: number
}

const chartConfig = {
  count: {
    label: 'Ученики',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

export function ChartByMonth({ data }: { data: ChartData[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Динамика по месяцам</CardTitle>
        <CardDescription>Новые активные студенты</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              top: 20,
              bottom: 8,
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <Line
              dataKey="count"
              type="natural"
              stroke="var(--color-count)"
              strokeWidth={2}
              dot={{
                fill: 'var(--color-count)',
              }}
              activeDot={{
                r: 6,
              }}
            >
              <LabelList position="bottom" offset={12} className="fill-foreground" fontSize={12} />
            </Line>
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
