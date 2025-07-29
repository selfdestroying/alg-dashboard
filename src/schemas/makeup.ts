import { z } from 'zod/v4'

export const MakeUpSchema = z.object({
  makeUpLessonId: z.number().int().positive(),
})

export type MakeUpSchemaType = z.infer<typeof MakeUpSchema>
