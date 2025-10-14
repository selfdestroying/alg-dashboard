import { Card, CardContent } from '@/components/ui/card'
import { Coins, TrendingUp, Users2 } from 'lucide-react'

interface Props {
  totalRevenue: number
  totalLessons: number
  paymentRate: number
}

export function RevenueSummary({ totalRevenue, totalLessons, paymentRate }: Props) {
  const cards = [
    { title: 'Доход за период', value: `${totalRevenue.toLocaleString()} ₽`, icon: Coins },
    { title: 'Ученикоуроков', value: totalLessons, icon: Users2 },
    { title: 'Оплачено', value: `${Math.round(paymentRate * 100)}%`, icon: TrendingUp },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((item) => (
        <Card key={item.title} className="border shadow-sm">
          <CardContent className="flex items-center gap-2">
            <item.icon className="text-primary h-8 w-8" />
            <div>
              <p className="text-muted-foreground text-sm">{item.title}</p>
              <p className="text-2xl font-semibold">{item.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
