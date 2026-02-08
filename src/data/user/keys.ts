export const userKeys = {
  all: () => ['user'] as const,
  session: () => [...userKeys.all(), 'session'] as const,
  list: (organizationId: number) => [...userKeys.all(), 'list', { organizationId }] as const,
}
