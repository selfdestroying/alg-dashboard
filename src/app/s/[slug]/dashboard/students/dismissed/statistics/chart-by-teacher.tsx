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
  teacherName: string
  dismissedCount: number
  totalStudents: number
  percentage: number
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

export function ChartByTeacher({ data }: { data: ChartData[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Отток по учителям</CardTitle>
        <CardDescription>Количество отчисленных студентов по каждому преподавателю</CardDescription>
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
              dataKey="teacherName"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
              hide
            />
            <XAxis dataKey="percentage" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(label, payload) => payload[0]?.payload.teacherName || label}
                  formatter={(value, name, item) => {
                    const data = item?.payload as ChartData | undefined
                    const percentage = data?.percentage || 0
                    const dismissedCount = data?.dismissedCount || 0
                    const totalStudents = data?.totalStudents || 0
                    return (
                      <div className="text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Всего студентов:</span>
                          <span className="font-medium">{totalStudents}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Отчисленные:</span>
                          <span className="text-destructive font-medium">{dismissedCount}</span>
                        </div>
                        <div className="flex items-center justify-between border-t pt-1.5">
                          <span className="text-muted-foreground">Процент оттока:</span>
                          <span className="font-semibold">{percentage}%</span>
                        </div>
                      </div>
                    )
                  }}
                />
              }
            />
            <Bar dataKey="percentage" fill="var(--color-dismissed)" radius={4}>
              <LabelList
                dataKey="teacherName"
                formatter={(value: string) => (value ? value.toString().split(' ')[0] : '')}
                position="insideLeft"
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
