export const lessonKeys = {
  all: ['lessons'] as const,
  lists: () => [...lessonKeys.all, 'list'] as const,
  list: (organizationId: number) => [...lessonKeys.lists(), { organizationId }] as const,
  byDate: (organizationId: number, date: string) =>
    [...lessonKeys.lists(), { organizationId, date }] as const,
  byMonth: (organizationId: number, month: string) =>
    [...lessonKeys.lists(), { organizationId, month }] as const,
}
