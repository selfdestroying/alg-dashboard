import z from "zod/v4";


export const PaycheckSchema = z.object({
    amount: z.number().positive(),
    comment: z.string(),
    date: z.date(),
    userId: z.number()
})


export type PaycheckSchemaType = z.infer<typeof PaycheckSchema>