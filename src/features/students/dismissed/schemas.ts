import * as z from 'zod'

export const DeleteDismissedSchema = z.object({
  studentId: z.number().int().positive(),
  groupId: z.number().int().positive(),
})

export const ReturnToGroupSchema = z.object({
  groupId: z.number().int().positive(),
  studentId: z.number().int().positive(),
})

export type DeleteDismissedSchemaType = z.infer<typeof DeleteDismissedSchema>
export type ReturnToGroupSchemaType = z.infer<typeof ReturnToGroupSchema>
