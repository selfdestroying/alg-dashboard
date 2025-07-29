'use client'

import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface ChartProps {
  data: { xAxisData: string | number; yAxisData: number }[]
  type: 'line' | 'pie'
}

const COLORS = ['#fb2c36', '#009966', '#fe9a00']

export default function Chart({ data, type }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      {type === 'line' ? (
        <LineChart data={data}>
          <XAxis dataKey="xAxisData" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="yAxisData" stroke="#3b82f6" strokeWidth={2} />
        </LineChart>
      ) : (
        <PieChart>
          <Pie data={data} dataKey="yAxisData" nameKey="xAxisData" label>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      )}
    </ResponsiveContainer>
  )
}
