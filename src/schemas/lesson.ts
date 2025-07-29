import { z } from 'zod/v4'

export const LessonSchema = z.object({
  date: z.date(),
  time: z.string(),
})

export type LessonSchemaType = z.infer<typeof LessonSchema>
