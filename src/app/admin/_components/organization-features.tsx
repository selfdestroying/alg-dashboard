'use client'

import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { Switch } from '@/src/components/ui/switch'
import { getChildFeatures, getRootFeatures } from '@/src/lib/features/registry'
import { Loader2, Settings2 } from 'lucide-react'
import { useCallback, useState, useTransition } from 'react'
import {
  getOrganizationFeatures,
  toggleOrganizationFeature,
  type OrganizationFeatureState,
} from '../_actions/features'

interface OrganizationFeaturesProps {
  organizationId: number
}

export default function OrganizationFeatures({ organizationId }: OrganizationFeaturesProps) {
  const [features, setFeatures] = useState<OrganizationFeatureState[] | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, startLoading] = useTransition()
  const [togglingKey, setTogglingKey] = useState<string | null>(null)

  const load = useCallback(() => {
    startLoading(async () => {
      const data = await getOrganizationFeatures(organizationId)
      setFeatures(data)
      setIsOpen(true)
    })
  }, [organizationId])

  const handleToggle = useCallback(
    async (featureKey: string, enabled: boolean) => {
      setTogglingKey(featureKey)
      try {
        await toggleOrganizationFeature(organizationId, featureKey, enabled)
        setFeatures(
          (prev) => prev?.map((f) => (f.featureKey === featureKey ? { ...f, enabled } : f)) ?? null,
        )
      } finally {
        setTogglingKey(null)
      }
    },
    [organizationId],
  )

  if (!isOpen) {
    return (
      <Button variant="outline" size="sm" onClick={load} disabled={isLoading} className="gap-1.5">
        {isLoading ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Settings2 className="size-3.5" />
        )}
        Фичи
      </Button>
    )
  }

  if (!features) return null

  const featureMap = new Map(features.map((f) => [f.featureKey, f]))
  const rootFeatures = getRootFeatures()

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Управление фичами</h4>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
          Скрыть
        </Button>
      </div>

      <div className="grid gap-2">
        {rootFeatures.map((rootKey) => {
          const rootFeature = featureMap.get(rootKey)
          if (!rootFeature) return null

          const children = getChildFeatures(rootKey)
          const childFeatures = children
            .map((k) => featureMap.get(k))
            .filter(Boolean) as OrganizationFeatureState[]

          return (
            <div key={rootKey} className="bg-muted/50 rounded-md border p-2.5">
              <FeatureToggleRow
                feature={rootFeature}
                isToggling={togglingKey === rootKey}
                onToggle={handleToggle}
                isRoot
              />

              {childFeatures.length > 0 && (
                <div className="mt-1.5 ml-5 space-y-1">
                  {childFeatures.map((child) => (
                    <FeatureToggleRow
                      key={child.featureKey}
                      feature={child}
                      isToggling={togglingKey === child.featureKey}
                      onToggle={handleToggle}
                      parentDisabled={!rootFeature.enabled}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function FeatureToggleRow({
  feature,
  isToggling,
  onToggle,
  isRoot,
  parentDisabled,
}: {
  feature: OrganizationFeatureState
  isToggling: boolean
  onToggle: (key: string, enabled: boolean) => void
  isRoot?: boolean
  parentDisabled?: boolean
}) {
  const effectivelyDisabled = parentDisabled || !feature.enabled

  return (
    <div className="flex items-center justify-between gap-2 py-0.5">
      <div className="flex items-center gap-2">
        <span
          className={`text-sm ${isRoot ? 'font-medium' : ''} ${effectivelyDisabled && !isRoot ? 'text-muted-foreground' : ''}`}
        >
          {feature.label}
        </span>
        {parentDisabled && (
          <Badge variant="outline" className="text-muted-foreground text-[10px]">
            родитель выкл.
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        {isToggling && <Loader2 className="text-muted-foreground size-3 animate-spin" />}
        <Switch
          size="sm"
          checked={feature.enabled}
          onCheckedChange={(checked) => onToggle(feature.featureKey, checked)}
          disabled={isToggling || parentDisabled}
        />
      </div>
    </div>
  )
}
