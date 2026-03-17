'use client'

import { useSessionQuery } from '@/src/data/user/session-query'
import { isFeatureDisabled } from '@/src/lib/features/registry'

/** Check if a feature is enabled for the current organization */
export function useFeatureEnabled(featureKey: string): boolean {
  const { data: session } = useSessionQuery()
  const disabledFeatures = (session?.disabledFeatures as string[] | undefined) ?? []
  return !isFeatureDisabled(disabledFeatures, featureKey)
}
