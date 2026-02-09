export const memberKeys = {
  all: () => ['members'] as const,
  lists: () => [...memberKeys.all(), 'list'] as const,
  detail: () => [...memberKeys.all(), 'detail'] as const,
  list: (organizationId: number) => [...memberKeys.lists(), { organizationId }] as const,
  activeMember: () => [...memberKeys.all(), 'active-member'] as const,
}
