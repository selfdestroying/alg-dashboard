'use client'

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/src/components/ui/chart'

export const description = 'A bar chart with a custom label'

interface ChartData {
  name: string
  count: number
}

const chartConfig = {
  dismissed: {
    label: 'Отчисленные',
    color: 'var(--chart-2)',
  },
  percentage: {
    label: 'Процент оттока',
    color: 'var(--chart-1)',
  },
  label: {
    color: 'var(--color-foreground)',
  },
} satisfies ChartConfig

export function ChartByCourse({ data }: { data: ChartData[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Отток по курсам</CardTitle>
        <CardDescription>Количество отчисленных студентов по каждому курсу</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{
              right: 16,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
              hide
            />
            <XAxis dataKey="count" type="number" hide />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Bar dataKey="count" layout="vertical" fill="var(--color-dismissed)" radius={4}>
              <LabelList
                dataKey="count"
                position="insideLeft"
                offset={8}
                className="fill-(--color-label)"
                fontSize={12}
              />
              <LabelList
                dataKey="name"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
