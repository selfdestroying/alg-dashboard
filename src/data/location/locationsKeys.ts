export const locationKeys = {
  all: ['locations'] as const,
  lists: () => [...locationKeys.all, 'list'] as const,
  list: (organizationId: number) => [...locationKeys.lists(), { organizationId }] as const,
}
