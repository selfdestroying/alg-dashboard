import { isFeatureDisabled } from './registry'

/**
 * Maps URL pathname patterns to feature keys.
 * Order matters - first match wins. More specific patterns go first.
 */
const ROUTE_FEATURE_MAP: [RegExp, string][] = [
  // Students
  [/^\/students\/active/, 'students.active'],
  [/^\/students\/absent/, 'students.absent'],
  [/^\/students\/dismissed/, 'students.dismissed'],
  [/^\/students/, 'students'],

  // Groups
  [/^\/groups\/types/, 'groups.types'],
  [/^\/groups/, 'groups'],

  // Finances
  [/^\/finances\/payments/, 'finances.payments'],
  [/^\/finances\/unprocessed/, 'finances.unprocessedPayments'],
  [/^\/finances\/revenue/, 'finances.revenue'],
  [/^\/finances\/advances/, 'finances.advances'],
  [/^\/finances\/salaries/, 'finances.salaries'],
  [/^\/finances\/manager-salaries/, 'finances.managerSalaries'],
  [/^\/finances\/profit-monthly/, 'finances.profitMonthly'],
  [/^\/finances\/profit/, 'finances.profit'],
  [/^\/finances/, 'finances'],
  [/^\/finances\/payment-methods/, 'finances.paymentMethods'],

  // Shop
  [/^\/shop\/products/, 'shop.products'],
  [/^\/shop\/categories/, 'shop.categories'],
  [/^\/shop\/orders/, 'shop.orders'],
  [/^\/shop/, 'shop'],

  // Organization sub-pages
  [/^\/organization\/rates/, 'organization.rates'],
  [/^\/organization\/courses/, 'organization.courses'],
  [/^\/organization\/locations/, 'organization.locations'],
]

/** Resolve the feature key for a given pathname (without the /[slug] prefix) */
export function getFeatureKeyForRoute(pathname: string): string | null {
  for (const [pattern, featureKey] of ROUTE_FEATURE_MAP) {
    if (pattern.test(pathname)) return featureKey
  }
  return null
}

/** Check if a route is blocked because its feature is disabled */
export function isRouteDisabled(pathname: string, disabledFeatures: string[]): boolean {
  if (disabledFeatures.length === 0) return false

  const featureKey = getFeatureKeyForRoute(pathname)
  if (!featureKey) return false

  return isFeatureDisabled(disabledFeatures, featureKey)
}
