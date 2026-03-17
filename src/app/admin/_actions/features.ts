'use server'

import prisma from '@/src/lib/db/prisma'
import { FEATURE_KEYS, FEATURE_REGISTRY, type FeatureKey } from '@/src/lib/features/registry'

export type OrganizationFeatureState = {
  featureKey: FeatureKey
  label: string
  parent?: FeatureKey
  enabled: boolean
}

/** Get all feature states for an organization, merging registry with DB overrides */
export async function getOrganizationFeatures(
  organizationId: number,
): Promise<OrganizationFeatureState[]> {
  const overrides = await prisma.organizationFeature.findMany({
    where: { organizationId },
    select: { featureKey: true, enabled: true },
  })

  const overrideMap = new Map<string, boolean>(overrides.map((o) => [o.featureKey, o.enabled]))

  return FEATURE_KEYS.map((key) => ({
    featureKey: key,
    label: FEATURE_REGISTRY[key].label,
    parent: FEATURE_REGISTRY[key].parent,
    enabled: overrideMap.get(key) ?? true,
  })) satisfies OrganizationFeatureState[]
}

/** Toggle a feature for an organization. Upserts the DB record. */
export async function toggleOrganizationFeature(
  organizationId: number,
  featureKey: string,
  enabled: boolean,
): Promise<void> {
  if (!FEATURE_KEYS.includes(featureKey as FeatureKey)) {
    throw new Error(`Unknown feature key: ${featureKey}`)
  }

  await prisma.organizationFeature.upsert({
    where: {
      organizationId_featureKey: { organizationId, featureKey },
    },
    update: { enabled },
    create: { organizationId, featureKey, enabled },
  })
}

/** Bulk update features for an organization */
export async function bulkToggleOrganizationFeatures(
  organizationId: number,
  features: { featureKey: string; enabled: boolean }[],
): Promise<void> {
  const validKeys = new Set<string>(FEATURE_KEYS)
  const validFeatures = features.filter((f) => validKeys.has(f.featureKey))

  await prisma.$transaction(
    validFeatures.map((f) =>
      prisma.organizationFeature.upsert({
        where: {
          organizationId_featureKey: { organizationId, featureKey: f.featureKey },
        },
        update: { enabled: f.enabled },
        create: { organizationId, featureKey: f.featureKey, enabled: f.enabled },
      }),
    ),
  )
}
