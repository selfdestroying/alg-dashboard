import type { OrganizationRole } from '@/src/lib/auth/server'
import { isFeatureDisabled } from '@/src/lib/features/registry'
import type { NavEntry } from './nav-config'
import type { NavGroupChild } from './types'
import { isSubGroup } from './types'

function isAllowed(
  e: { roles: OrganizationRole[]; featureKey?: string },
  role: OrganizationRole,
  disabled: string[],
): boolean {
  if (!e.roles.includes(role)) return false
  if (e.featureKey && isFeatureDisabled(disabled, e.featureKey)) return false
  return true
}

/**
 * Filter the unified nav tree by current role and disabled features.
 * Drops entries the user can't access; drops groups/subgroups left empty
 * unless they have their own landing url.
 */
export function filterNav(
  entries: NavEntry[],
  role: OrganizationRole,
  disabledFeatures: string[],
): NavEntry[] {
  const result: NavEntry[] = []

  for (const entry of entries) {
    if (!isAllowed(entry, role, disabledFeatures)) continue

    if (entry.kind === 'leaf') {
      result.push(entry)
      continue
    }

    const children: NavGroupChild[] = []
    for (const child of entry.items) {
      if (!isAllowed(child, role, disabledFeatures)) continue

      if (isSubGroup(child)) {
        const subItems = child.items.filter((i) => isAllowed(i, role, disabledFeatures))
        if (subItems.length === 0 && !child.url) continue
        children.push({ ...child, items: subItems })
      } else {
        children.push(child)
      }
    }

    if (children.length === 0 && !entry.url) continue
    result.push({ ...entry, items: children })
  }

  return result
}

/**
 * Case-insensitive substring search across leafs, group/subgroup titles, and sub-items.
 * Matching a parent surfaces all of its descendants; matching only descendants surfaces
 * just the matched ones.
 */
export function searchNav(entries: NavEntry[], query: string): NavEntry[] {
  const q = query.trim().toLowerCase()
  if (!q) return entries

  const result: NavEntry[] = []
  for (const entry of entries) {
    if (entry.kind === 'leaf') {
      if (entry.title.toLowerCase().includes(q)) result.push(entry)
      continue
    }

    const groupMatches = entry.title.toLowerCase().includes(q)
    const matchedChildren: NavGroupChild[] = []

    for (const child of entry.items) {
      if (isSubGroup(child)) {
        const sgMatches = child.title.toLowerCase().includes(q)
        if (groupMatches || sgMatches) {
          matchedChildren.push({ ...child })
          continue
        }
        const matchedSubItems = child.items.filter((i) => i.title.toLowerCase().includes(q))
        if (matchedSubItems.length > 0) {
          matchedChildren.push({ ...child, items: matchedSubItems })
        }
      } else if (groupMatches || child.title.toLowerCase().includes(q)) {
        matchedChildren.push(child)
      }
    }

    if (groupMatches || matchedChildren.length > 0) {
      result.push({ ...entry, items: matchedChildren })
    }
  }

  return result
}
