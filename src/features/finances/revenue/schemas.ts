import z from 'zod'

export const RevenueFiltersSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  courseIds: z.array(z.number()).optional(),
  locationIds: z.array(z.number()).optional(),
  teacherIds: z.array(z.number()).optional(),
})
