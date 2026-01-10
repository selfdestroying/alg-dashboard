import { Badge } from '@/components/ui/badge'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

interface BalanceBadgeProps {
  balance: number | string
  currency?: string
  className?: string
}

export default function BalanceBadge({ balance }: BalanceBadgeProps) {
  const [isRevealed, setIsRevealed] = useState(false)

  return (
    <Badge
      variant={'success'}
      className="group h-6 w-14 cursor-pointer text-center"
      role="button"
      onClick={() => setIsRevealed(!isRevealed)}
    >
      {isRevealed ? (
        <span className="inline text-xs group-hover:hidden">
          {balance.toLocaleString('ru-RU')} ₽
        </span>
      ) : (
        <span className="inline text-lg group-hover:hidden">⁎⁎⁎</span>
      )}
      {isRevealed ? (
        <EyeOff className="hidden group-hover:inline" />
      ) : (
        <Eye className="hidden group-hover:inline" />
      )}
    </Badge>
  )
}
