import * as z from 'zod'

export const SnoozeAlertSchema = z.object({
  alertType: z.string(),
  entityKey: z.string(),
  snoozeDays: z.int().min(1).max(30).default(2),
})

export type SnoozeAlertSchemaType = z.infer<typeof SnoozeAlertSchema>
