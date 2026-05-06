'use server'

import prisma from '@/src/lib/db/prisma'
import { publicAction } from '@/src/lib/safe-action'
import { getAgeFromBirthDate } from '@/src/lib/utils'
import {
  ConfirmPublicActualitySchema,
  CreatePublicParentSchema,
  UpdatePublicParentSchema,
  UpdatePublicStudentSchema,
} from './schemas'

// ─── Helpers ────────────────────────────────────────────────────────

async function getStudentByToken(token: string) {
  return prisma.student.findUnique({
    where: { editToken: token },
    select: { id: true, organizationId: true },
  })
}

// ─── Get public student data ────────────────────────────────────────

export const getPublicStudentData = publicAction
  .metadata({ actionName: 'getPublicStudentData' })
  .inputSchema(ConfirmPublicActualitySchema)
  .action(async ({ parsedInput }) => {
    const student = await prisma.student.findUnique({
      where: { editToken: parsedInput.token },
      select: {
        editToken: true,
        firstName: true,
        lastName: true,
        age: true,
        birthDate: true,
        dataActual: true,
        dataActualizedAt: true,
        organization: { select: { name: true } },
        parents: {
          include: {
            parent: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!student) return null
    return student
  })

// ─── Update student ─────────────────────────────────────────────────

export const updatePublicStudent = publicAction
  .metadata({ actionName: 'updatePublicStudent' })
  .inputSchema(UpdatePublicStudentSchema)
  .action(async ({ parsedInput }) => {
    const student = await getStudentByToken(parsedInput.token)
    if (!student) throw new Error('Анкета по этой ссылке не найдена.')

    const birthDate = parsedInput.birthDate

    const updated = await prisma.student.update({
      where: { id: student.id },
      data: {
        firstName: parsedInput.firstName,
        lastName: parsedInput.lastName,
        birthDate,
        age: birthDate ? getAgeFromBirthDate(birthDate) : null,
        dataActual: false,
        dataActualizedAt: null,
      },
      select: {
        firstName: true,
        lastName: true,
        age: true,
        birthDate: true,
        dataActual: true,
        dataActualizedAt: true,
      },
    })

    return {
      firstName: updated.firstName,
      lastName: updated.lastName,
      age: updated.age,
      birthDate: updated.birthDate ? updated.birthDate.toISOString().slice(0, 10) : null,
      dataActual: updated.dataActual,
      dataActualizedAt: updated.dataActualizedAt?.toISOString() ?? null,
    }
  })

// ─── Update parent ──────────────────────────────────────────────────

export const updatePublicParent = publicAction
  .metadata({ actionName: 'updatePublicParent' })
  .inputSchema(UpdatePublicParentSchema)
  .action(async ({ parsedInput }) => {
    const student = await getStudentByToken(parsedInput.token)
    if (!student) throw new Error('Анкета по этой ссылке не найдена.')

    const link = await prisma.studentParent.findUnique({
      where: { studentId_parentId: { studentId: student.id, parentId: parsedInput.parentId } },
      select: { parentId: true },
    })

    if (!link) throw new Error('Нельзя изменить эти данные по текущей ссылке.')

    const updated = await prisma.$transaction(async (tx) => {
      const parent = await tx.parent.update({
        where: { id: parsedInput.parentId, organizationId: student.organizationId },
        data: {
          firstName: parsedInput.firstName,
          lastName: parsedInput.lastName,
          phone: parsedInput.phone,
          email: parsedInput.email,
        },
        select: { id: true, firstName: true, lastName: true, phone: true, email: true },
      })

      await tx.student.update({
        where: { id: student.id },
        data: { dataActual: false, dataActualizedAt: null },
      })

      return parent
    })

    return updated
  })

// ─── Create parent ──────────────────────────────────────────────────

export const createPublicParent = publicAction
  .metadata({ actionName: 'createPublicParent' })
  .inputSchema(CreatePublicParentSchema)
  .action(async ({ parsedInput }) => {
    const student = await getStudentByToken(parsedInput.token)
    if (!student) throw new Error('Анкета по этой ссылке не найдена.')

    const parent = await prisma.$transaction(async (tx) => {
      const created = await tx.parent.create({
        data: {
          firstName: parsedInput.firstName,
          lastName: parsedInput.lastName,
          phone: parsedInput.phone,
          email: parsedInput.email,
          organizationId: student.organizationId,
        },
        select: { id: true, firstName: true, lastName: true, phone: true, email: true },
      })

      await tx.studentParent.create({
        data: {
          studentId: student.id,
          parentId: created.id,
        },
      })

      await tx.student.update({
        where: { id: student.id },
        data: { dataActual: false, dataActualizedAt: null },
      })

      return created
    })

    return parent
  })

// ─── Confirm actuality ──────────────────────────────────────────────

export const confirmPublicDataActuality = publicAction
  .metadata({ actionName: 'confirmPublicDataActuality' })
  .inputSchema(ConfirmPublicActualitySchema)
  .action(async ({ parsedInput }) => {
    const student = await getStudentByToken(parsedInput.token)
    if (!student) throw new Error('Анкета по этой ссылке не найдена.')

    const updated = await prisma.student.update({
      where: { id: student.id },
      data: { dataActual: true, dataActualizedAt: new Date() },
      select: { dataActualizedAt: true },
    })

    return {
      dataActual: true as const,
      dataActualizedAt: updated.dataActualizedAt!.toISOString(),
    }
  })
