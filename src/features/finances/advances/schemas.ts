import { z } from 'zod'

export const AdvancesFiltersSchema = z.object({
  /** ISO-строка начала периода */
  startDate: z.string(),
  /** ISO-строка конца периода */
  endDate: z.string(),
})

export type AdvancesFilters = z.infer<typeof AdvancesFiltersSchema>
