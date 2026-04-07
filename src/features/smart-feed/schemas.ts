import * as z from 'zod'

import { ALERT_TYPE } from './types'

const AlertTypeSchema = z.enum([
  ALERT_TYPE.UNMARKED_ATTENDANCE,
  ALERT_TYPE.LOW_BALANCE,
  ALERT_TYPE.NEGATIVE_BALANCE,
  ALERT_TYPE.CONSECUTIVE_ABSENCES,
])

export const SnoozeAlertSchema = z.object({
  alertType: AlertTypeSchema,
  entityKey: z.string().min(1),
  snoozeDays: z.int().min(1).max(30).default(2),
})

export type SnoozeAlertSchemaType = z.infer<typeof SnoozeAlertSchema>

export const RestoreSnoozedAlertSchema = z.object({
  alertType: AlertTypeSchema,
  entityKey: z.string().min(1),
})

export type RestoreSnoozedAlertSchemaType = z.infer<typeof RestoreSnoozedAlertSchema>
