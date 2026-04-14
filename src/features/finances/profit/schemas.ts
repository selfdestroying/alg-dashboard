import * as z from 'zod'

export const ProfitFiltersSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
})

export type ProfitFilters = z.infer<typeof ProfitFiltersSchema>
