import { isFeatureDisabled } from '@/src/lib/features/registry'
import type { NavGroup } from './types'

export function filterNavByFeatures(nav: NavGroup[], disabledFeatures: string[]): NavGroup[] {
  if (disabledFeatures.length === 0) return nav

  return nav
    .filter((group) => !group.featureKey || !isFeatureDisabled(disabledFeatures, group.featureKey))
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.featureKey || !isFeatureDisabled(disabledFeatures, item.featureKey),
      ),
    }))
    .filter((group) => group.items.length > 0)
}
