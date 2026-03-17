/**
 * Feature registry — source of truth for all toggleable features.
 * DB stores only overrides (disabled features). By default everything is enabled.
 */

export const FEATURE_KEYS = [
  'students',
  'students.active',
  'students.absent',
  'students.dismissed',
  'groups',
  'groups.types',
  'finances',
  'finances.payments',
  'finances.unprocessedPayments',
  'finances.revenue',
  'finances.salaries',
  'shop',
  'shop.products',
  'shop.categories',
  'shop.orders',
  'organization.rates',
  'organization.courses',
  'organization.locations',
] as const

export type FeatureKey = (typeof FEATURE_KEYS)[number]

type FeatureEntry = {
  label: string
  description?: string
  parent?: FeatureKey
}

export const FEATURE_REGISTRY: Record<FeatureKey, FeatureEntry> = {
  // — Ученики —
  students: { label: 'Ученики' },
  'students.active': { label: 'Активные', parent: 'students' },
  'students.absent': { label: 'Пропустившие', parent: 'students' },
  'students.dismissed': { label: 'Отчисленные', parent: 'students' },

  // — Группы —
  groups: { label: 'Группы' },
  'groups.types': { label: 'Типы групп', parent: 'groups' },

  // — Финансы —
  finances: { label: 'Финансы' },
  'finances.payments': { label: 'Оплаты', parent: 'finances' },
  'finances.revenue': { label: 'Выручка', parent: 'finances' },
  'finances.salaries': { label: 'Зарплаты', parent: 'finances' },
  'finances.unprocessedPayments': { label: 'Неразобранное', parent: 'finances' },

  // — Магазин —
  shop: { label: 'Магазин' },
  'shop.products': { label: 'Товары', parent: 'shop' },
  'shop.categories': { label: 'Категории', parent: 'shop' },
  'shop.orders': { label: 'Заказы', parent: 'shop' },

  // — Школа (подстраницы) —
  'organization.rates': { label: 'Ставки' },
  'organization.courses': { label: 'Курсы' },
  'organization.locations': { label: 'Локации' },
}

/** Get all child feature keys for a parent */
export function getChildFeatures(parentKey: FeatureKey): FeatureKey[] {
  return FEATURE_KEYS.filter((key) => FEATURE_REGISTRY[key].parent === parentKey)
}

/** Get all top-level (parentless) feature keys */
export function getRootFeatures(): FeatureKey[] {
  return FEATURE_KEYS.filter((key) => !FEATURE_REGISTRY[key].parent)
}

/**
 * Check if a feature is disabled, considering parent hierarchy.
 * A feature is disabled if it's explicitly in the list OR its parent is.
 */
export function isFeatureDisabled(disabledFeatures: string[], featureKey: string): boolean {
  if (disabledFeatures.includes(featureKey)) return true

  const entry = FEATURE_REGISTRY[featureKey as FeatureKey]
  if (entry?.parent && disabledFeatures.includes(entry.parent)) return true

  return false
}
