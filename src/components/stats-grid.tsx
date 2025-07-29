import { cn } from '@/lib/utils'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'

interface StatsCardProps {
  title: string
  value?: number
  change?: number
  icon: React.ReactNode
}

export function StatsCard({ title, value, change, icon }: StatsCardProps) {
  const percent = value && change ? Math.floor((change / value) * 100) : null
  const trendColor = percent && percent > 10 ? 'text-emerald-500' : 'text-red-500'

  return (
    <div className="group before:from-input/30 before:via-input before:to-input/30 relative p-4 before:absolute before:inset-y-8 before:right-0 before:w-px before:bg-gradient-to-b last:before:hidden lg:p-5">
      <div className="relative flex h-full items-center gap-4">
        {/* Icon */}
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-emerald-600/50 bg-emerald-600/25 text-emerald-500 max-[480px]:hidden">
          {icon}
        </div>
        {/* Content */}
        <div>
          <p className="text-muted-foreground/60 text-xs font-medium tracking-widest uppercase before:absolute before:inset-0">
            {title}
          </p>
          <div className="mb-2 text-2xl font-semibold">{value}</div>

          <div className="text-muted-foreground/60 text-xs">
            <div className={'flex items-center gap-1'}>
              {percent && (
                <>
                  <p className={cn('flex items-center font-medium', trendColor)}>
                    {percent > 10 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}{' '}
                    {change}
                  </p>
                  <span>за последний месяц ({percent}%)</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface StatsGridProps {
  stats: StatsCardProps[]
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="border-border from-sidebar/60 to-sidebar grid grid-cols-2 rounded-xl border bg-gradient-to-br min-[1200px]:grid-cols-2">
      {stats.map((stat) => (
        <StatsCard key={stat.title} {...stat} />
      ))}
    </div>
  )
}
