'use server'

import {
  TAX_SYSTEM_CONFIG_SCHEMAS,
  TAX_SYSTEMS,
  type TaxSystemKey,
  type UsnIncomeConfig,
} from '@/src/features/organization/tax-systems/schemas'
import prisma from '@/src/lib/db/prisma'
import { authAction } from '@/src/lib/safe-action'
import { DEFAULT_CHARGEABLE_STATUSES } from '../chargeable'
import { computeAttendanceRevenue } from '../chargeable.server'
import { ProfitFiltersSchema } from './schemas'
import type {
  AcquiringBreakdownItem,
  AcquiringData,
  ExpenseBreakdownItem,
  ExpenseData,
  ProfitData,
  RentBreakdownItem,
  RentData,
  SalaryData,
  TaxBreakdown,
} from './types'

export const getProfitData = authAction
  .metadata({ actionName: 'getProfitData' })
  .inputSchema(ProfitFiltersSchema)
  .action(async ({ ctx, parsedInput }): Promise<ProfitData> => {
    const { startDate, endDate } = parsedInput
    const organizationId = ctx.session.organizationId!

    // ── 1. Revenue ──────────────────────────────────────────────────────────
    const revenueEntries = await computeAttendanceRevenue({
      organizationId,
      startDate,
      endDate,
      chargeableStatuses: [...DEFAULT_CHARGEABLE_STATUSES],
    })
    const revenue = revenueEntries.reduce((sum, e) => sum + e.visitCost, 0)

    // ── 2. Taxes ────────────────────────────────────────────────────────────
    const taxConfig = await prisma.taxConfig.findUnique({
      where: { organizationId },
    })

    let taxBreakdown: TaxBreakdown
    let taxTotal: number

    const taxSystem = (taxConfig?.taxSystem ?? 'USN_INCOME') as TaxSystemKey
    const taxSystemMeta = TAX_SYSTEMS.find((s) => s.value === taxSystem)
    const taxSystemLabel = taxSystemMeta?.label ?? taxSystem

    if (taxSystem === 'USN_INCOME') {
      const schema = TAX_SYSTEM_CONFIG_SCHEMAS.USN_INCOME
      const config = schema.parse(
        (taxConfig?.config as Record<string, unknown>) ?? {},
      ) as UsnIncomeConfig

      const incomeTax = revenue * (config.incomeTaxRate / 100)

      // Insurance: 1% from revenue exceeding threshold
      const excessIncome = Math.max(0, revenue - config.insuranceThreshold)
      const insuranceContributions = excessIncome * (config.insuranceRate / 100)

      taxTotal = incomeTax + insuranceContributions + config.fixedContributions
      taxBreakdown = {
        taxSystem,
        taxSystemLabel,
        incomeTax: Math.round(incomeTax),
        incomeTaxRate: config.incomeTaxRate,
        insuranceContributions: Math.round(insuranceContributions),
        fixedContributions: config.fixedContributions,
      }
    } else {
      // Fallback for other tax systems — just show zero with label
      taxTotal = 0
      taxBreakdown = {
        taxSystem,
        taxSystemLabel,
        incomeTax: 0,
        incomeTaxRate: 0,
        insuranceContributions: 0,
        fixedContributions: 0,
      }
    }

    // ── 3. Acquiring fees ───────────────────────────────────────────────────
    const payments = await prisma.payment.findMany({
      where: {
        organizationId,
        date: { gte: startDate, lte: endDate },
      },
      select: {
        price: true,
        paymentMethod: {
          select: {
            id: true,
            name: true,
            commission: true,
          },
        },
      },
    })

    // Group by payment method
    const methodMap = new Map<number, { name: string; commission: number; totalPayments: number }>()

    for (const payment of payments) {
      if (!payment.paymentMethod) continue
      const { id, name, commission } = payment.paymentMethod
      const existing = methodMap.get(id)
      if (existing) {
        existing.totalPayments += payment.price
      } else {
        methodMap.set(id, { name, commission, totalPayments: payment.price })
      }
    }

    const acquiringBreakdown: AcquiringBreakdownItem[] = []
    let acquiringTotal = 0

    for (const [, method] of methodMap) {
      const fee = method.totalPayments * (method.commission / 100)
      acquiringTotal += fee
      acquiringBreakdown.push({
        methodName: method.name,
        commissionPercent: method.commission,
        paymentSum: method.totalPayments,
        fee: Math.round(fee),
      })
    }

    const acquiring: AcquiringData = {
      total: Math.round(acquiringTotal),
      breakdown: acquiringBreakdown,
    }

    // ── 4. Salaries ─────────────────────────────────────────────────────────
    const lessons = await prisma.lesson.findMany({
      where: {
        organizationId,
        date: { gte: startDate, lte: endDate },
        status: { not: 'CANCELLED' },
      },
      select: {
        teachers: {
          select: {
            bid: true,
            bonusPerStudent: true,
            teacherId: true,
          },
        },
        _count: { select: { attendance: { where: { status: 'PRESENT' } } } },
      },
    })

    const teacherIds = new Set<number>()
    let totalFromLessons = 0
    let lessonCount = 0

    for (const lesson of lessons) {
      for (const tl of lesson.teachers) {
        teacherIds.add(tl.teacherId)
        const bonusTotal = tl.bonusPerStudent * (lesson._count?.attendance ?? 0)
        totalFromLessons += tl.bid + bonusTotal
      }
      lessonCount++
    }

    const paychecks = await prisma.payCheck.findMany({
      where: {
        organizationId,
        date: { gte: startDate, lte: endDate },
      },
      select: { amount: true },
    })

    const totalFromPaychecks = paychecks.reduce((sum, p) => sum + p.amount, 0)

    const salaries: SalaryData = {
      total: totalFromLessons + totalFromPaychecks,
      totalFromLessons,
      totalFromPaychecks,
      teacherCount: teacherIds.size,
      lessonCount,
    }

    // ── 5. Rent ─────────────────────────────────────────────────────────────
    const rents = await prisma.rent.findMany({
      where: {
        organizationId,
        AND: [{ startDate: { lte: endDate } }, { endDate: { gte: startDate } }],
      },
      select: {
        amount: true,
        location: {
          select: { name: true },
        },
      },
    })

    const rentLocationMap = new Map<string, number>()
    let rentTotal = 0

    for (const r of rents) {
      const locationName = r.location.name
      rentLocationMap.set(locationName, (rentLocationMap.get(locationName) ?? 0) + r.amount)
      rentTotal += r.amount
    }

    const rentBreakdown: RentBreakdownItem[] = []
    for (const [locationName, amount] of rentLocationMap) {
      rentBreakdown.push({ locationName, amount })
    }

    const rent: RentData = {
      total: rentTotal,
      breakdown: rentBreakdown,
    }

    // ── 6. Other expenses ───────────────────────────────────────────────────
    const expensesRaw = await prisma.expense.findMany({
      where: {
        organizationId,
        date: { gte: startDate, lte: endDate },
      },
      select: {
        name: true,
        amount: true,
      },
    })

    const expenseNameMap = new Map<string, number>()
    let expenseTotal = 0

    for (const e of expensesRaw) {
      expenseNameMap.set(e.name, (expenseNameMap.get(e.name) ?? 0) + e.amount)
      expenseTotal += e.amount
    }

    const expenseBreakdown: ExpenseBreakdownItem[] = []
    for (const [name, amount] of expenseNameMap) {
      expenseBreakdown.push({ name, amount })
    }

    const expenses: ExpenseData = {
      total: expenseTotal,
      breakdown: expenseBreakdown,
    }

    // ── 7. Profit ───────────────────────────────────────────────────────────
    const profit = Math.round(
      revenue - taxTotal - acquiring.total - salaries.total - rent.total - expenses.total,
    )

    return {
      revenue: Math.round(revenue),
      taxes: {
        total: Math.round(taxTotal),
        breakdown: taxBreakdown,
      },
      acquiring,
      salaries,
      rent,
      expenses,
      profit,
    }
  })
