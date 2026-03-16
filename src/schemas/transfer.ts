import * as z from 'zod'

export const TransferStudentSchema = z.object({
  groupId: z.int('Выберите группу').positive('Выберите группу'),
})

export type TransferStudentSchemaType = z.infer<typeof TransferStudentSchema>
