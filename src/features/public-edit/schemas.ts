import { normalizeDateOnly } from '@/src/lib/timezone'
import * as z from 'zod'

// ─── Token ──────────────────────────────────────────────────────────

export const TokenSchema = z.string().uuid()

// ─── Helpers ────────────────────────────────────────────────────────

const NullableTextSchema = z
  .string()
  .trim()
  .transform((value) => (value.length ? value : null))

// ─── Student input ──────────────────────────────────────────────────

export const UpdatePublicStudentSchema = z.object({
  token: TokenSchema,
  firstName: z.string().trim().min(2),
  lastName: z.string().trim().min(2),
  birthDate: z
    .string()
    .trim()
    .transform((value, ctx) => {
      if (!value) return null

      const date = new Date(`${value}T00:00:00`)
      if (Number.isNaN(date.getTime())) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Некорректная дата рождения' })
        return z.NEVER
      }

      return normalizeDateOnly(date)
    }),
})

// ─── Parent input ───────────────────────────────────────────────────

export const UpdatePublicParentSchema = z.object({
  token: TokenSchema,
  parentId: z.number().int().positive(),
  firstName: z.string().trim().min(2),
  lastName: NullableTextSchema.pipe(z.string().min(2).nullable()),
  phone: NullableTextSchema.pipe(
    z
      .string()
      .regex(/^\+?[0-9\s\-()]{7,15}$/)
      .nullable(),
  ),
  email: NullableTextSchema.pipe(z.string().email().nullable()),
})

export const CreatePublicParentSchema = z.object({
  token: TokenSchema,
  firstName: z.string().trim().min(2),
  lastName: NullableTextSchema.pipe(z.string().min(2).nullable()),
  phone: NullableTextSchema.pipe(
    z
      .string()
      .regex(/^\+?[0-9\s\-()]{7,15}$/)
      .nullable(),
  ),
  email: NullableTextSchema.pipe(z.string().email().nullable()),
})

// ─── Confirm actuality ──────────────────────────────────────────────

export const ConfirmPublicActualitySchema = z.object({
  token: TokenSchema,
})

// ─── Inferred types ─────────────────────────────────────────────────

export type UpdatePublicStudentSchemaType = z.input<typeof UpdatePublicStudentSchema>
export type UpdatePublicParentSchemaType = z.input<typeof UpdatePublicParentSchema>
export type CreatePublicParentSchemaType = z.input<typeof CreatePublicParentSchema>
export type ConfirmPublicActualitySchemaType = z.input<typeof ConfirmPublicActualitySchema>
