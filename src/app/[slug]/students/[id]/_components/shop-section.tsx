import { Hint } from '@/src/components/hint'
import { Coins, ShoppingCart } from 'lucide-react'
import AddCoinsForm from './add-coins-form'

interface ShopSectionProps {
  studentId: number
  coins: number
}

export default async function ShopSection({ coins, studentId }: ShopSectionProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-muted-foreground flex items-center gap-2 text-lg font-semibold">
        <ShoppingCart size={20} />
        Магазин
      </h3>
      <div className="bg-muted/50 relative w-fit overflow-hidden rounded-lg p-3 transition-colors">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground flex items-center gap-0.5 text-xs font-medium">
            Астрокоины
            <Hint text="Внутренняя валюта, которую ученик зарабатывает за активность на уроках и может потратить в магазине наград." />
          </span>
          <Coins className="text-muted-foreground size-4 shrink-0" />
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight">{coins}</span>
          <AddCoinsForm studentId={studentId} />
        </div>
      </div>
    </div>
  )
}
