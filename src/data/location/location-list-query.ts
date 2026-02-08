import { getLocations } from '@/src/actions/locations'
import { useQuery } from '@tanstack/react-query'
import { locationKeys } from './locationsKeys'

export async function getLocationList(organizationId: number) {
  const data = await getLocations({
    where: {
      organizationId,
    },
  })

  return data
}
export type LocationListData = Awaited<ReturnType<typeof getLocationList>>

export const useLocationListQuery = (organizationId: number) => {
  return useQuery({
    queryKey: locationKeys.list(organizationId),
    queryFn: () => getLocationList(organizationId),
    enabled: !!organizationId,
  })
}

export const useMappedLocationListQuery = (organizationId: number) => {
  return useQuery({
    queryKey: locationKeys.list(organizationId),
    queryFn: () => getLocationList(organizationId),
    enabled: !!organizationId,
    select: (locations) =>
      locations.map((location) => ({
        value: location.id.toString(),
        label: location.name,
      })),
  })
}
