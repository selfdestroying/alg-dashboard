export const courseKeys = {
  all: ['courses'] as const,
  lists: () => [...courseKeys.all, 'list'] as const,
  list: (organizationId: number) => [...courseKeys.lists(), { organizationId }] as const,
}
