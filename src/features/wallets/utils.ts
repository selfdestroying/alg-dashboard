import { getGroupName } from '@/src/lib/utils'
import type { WalletWithGroups } from './types'

export type BalanceVariant = 'success' | 'warning' | 'danger'

export function getBalanceVariant(balance: number): BalanceVariant {
  if (balance < 2) return 'danger'
  if (balance < 5) return 'warning'
  return 'success'
}

export function getBalanceLabel(variant: BalanceVariant): string {
  switch (variant) {
    case 'danger':
      return 'Критический'
    case 'warning':
      return 'Низкий'
    case 'success':
      return 'Норма'
  }
}

export function getBadgeVariant(variant: BalanceVariant) {
  switch (variant) {
    case 'danger':
      return 'destructive' as const
    case 'warning':
      return 'outline' as const
    case 'success':
      return 'secondary' as const
  }
}

export function getWalletLabel(w: WalletWithGroups) {
  const activeGroups = w.studentGroups.filter(
    (sg) => sg.status === 'ACTIVE' || sg.status === 'TRIAL',
  )
  const groupNames = activeGroups.map((sg) => getGroupName(sg.group)).join(', ')
  return w.name ? `${w.name} (${groupNames || 'без групп'})` : groupNames || `Кошелёк #${w.id}`
}
