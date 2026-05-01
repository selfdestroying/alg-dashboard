'use server'

import prisma from '@/src/lib/db/prisma'
import { authAction } from '@/src/lib/safe-action'
import { moscowNow, normalizeDateOnly } from '@/src/lib/timezone'
import { addDays } from 'date-fns'
import { RestoreSnoozedAlertSchema, SnoozeAlertSchema } from './schemas'
import {
  ALERT_TYPE,
  SMART_FEED_STATUS,
  compareSmartFeedAlerts,
  getSmartFeedAlertId,
  getSmartFeedEntityKey,
  type ConsecutiveAbsencesAlert,
  type LowBalanceAlert,
  type NegativeBalanceAlert,
  type SmartFeedAlert,
  type SmartFeedPageAlert,
  type SmartFeedPageData,
  type UnmarkedAttendanceAlert,
} from './types'

// ─── helpers ───────────────────────────────────────────────────────────

function parseLessonTime(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

function currentMoscowMinutes(): number {
  const now = moscowNow()
  return now.getHours() * 60 + now.getMinutes()
}

// ─── Query A: Unmarked attendance ──────────────────────────────────────

async function getUnmarkedAttendanceAlerts(
  organizationId: number,
): Promise<UnmarkedAttendanceAlert[]> {
  const today = normalizeDateOnly(moscowNow())
  const nowMinutes = currentMoscowMinutes()

  const lessons = await prisma.lesson.findMany({
    where: {
      organizationId,
      status: 'ACTIVE',
      attendance: { some: { status: 'UNSPECIFIED' } },
      date: { lte: today },
    },
    include: {
      group: { include: { course: true } },
      _count: { select: { attendance: { where: { status: 'UNSPECIFIED' } } } },
    },
    orderBy: [{ date: 'desc' }, { time: 'asc' }],
  })

  return lessons
    .filter((lesson) => {
      // For today's lessons, only show if time + 2h has passed
      const lessonDateMs = lesson.date.getTime()
      const todayMs = today.getTime()
      if (lessonDateMs === todayMs) {
        const lessonMinutes = parseLessonTime(lesson.time)
        return nowMinutes > lessonMinutes + 120
      }
      return true
    })
    .map((lesson) => ({
      type: ALERT_TYPE.UNMARKED_ATTENDANCE,
      severity: 'red' as const,
      lessonId: lesson.id,
      lessonDate: lesson.date,
      lessonTime: lesson.time,
      groupId: lesson.groupId,
      groupName: lesson.group.course.name,
      unspecifiedCount: lesson._count.attendance,
    }))
}

// ─── Query B: Low / Negative wallet balance ────────────────────────────

async function getBalanceAlerts(
  organizationId: number,
): Promise<(LowBalanceAlert | NegativeBalanceAlert)[]> {
  const wallets = await prisma.wallet.findMany({
    where: {
      organizationId,
      lessonsBalance: { lte: 1 },
    },
    include: {
      student: true,
      studentGroups: {
        where: {
          status: { in: ['ACTIVE', 'TRIAL'] },
          group: {
            isArchived: false,
          },
        },
        include: { group: { include: { course: true } } },
        take: 1,
      },
    },
  })

  const alerts: (LowBalanceAlert | NegativeBalanceAlert)[] = []

  for (const wallet of wallets) {
    const sg = wallet.studentGroups[0]
    if (!sg) continue

    const isDebt = wallet.lessonsBalance <= 0
    const studentName = `${wallet.student.firstName} ${wallet.student.lastName}`
    const groupName = sg.group.course.name

    if (isDebt) {
      alerts.push({
        type: ALERT_TYPE.NEGATIVE_BALANCE,
        severity: 'red',
        walletId: wallet.id,
        studentId: wallet.studentId,
        studentName,
        groupId: sg.groupId,
        groupName,
        lessonsBalance: wallet.lessonsBalance,
      })
    } else {
      alerts.push({
        type: ALERT_TYPE.LOW_BALANCE,
        severity: 'yellow',
        walletId: wallet.id,
        studentId: wallet.studentId,
        studentName,
        groupId: sg.groupId,
        groupName,
        lessonsBalance: wallet.lessonsBalance,
      })
    }
  }

  return alerts
}

// ─── Query C: Consecutive absences ─────────────────────────────────────

async function getConsecutiveAbsenceAlerts(
  organizationId: number,
): Promise<ConsecutiveAbsencesAlert[]> {
  const today = normalizeDateOnly(moscowNow())

  // Get active student-group pairs
  const studentGroups = await prisma.studentGroup.findMany({
    where: {
      organizationId,
      status: { in: ['ACTIVE', 'TRIAL'] },
      group: { isArchived: false },
    },
    select: {
      studentId: true,
      groupId: true,
      student: { select: { firstName: true, lastName: true } },
      group: { include: { course: true } },
    },
  })

  const alerts: ConsecutiveAbsencesAlert[] = []

  // For each student-group, check the last 2 completed lessons
  for (const sg of studentGroups) {
    const recentAttendance = await prisma.attendance.findMany({
      where: {
        organizationId,
        studentId: sg.studentId,
        lesson: {
          groupId: sg.groupId,
          status: 'ACTIVE',
          date: { lt: today },
        },
        status: { not: 'UNSPECIFIED' },
      },
      orderBy: { lesson: { date: 'desc' } },
      take: 2,
      select: { status: true, makeupAttendance: true },
    })

    if (
      recentAttendance.length >= 2 &&
      recentAttendance.every(
        (a) =>
          a.status === 'ABSENT' && (!a.makeupAttendance || a.makeupAttendance.status == 'ABSENT'),
      )
    ) {
      alerts.push({
        type: ALERT_TYPE.CONSECUTIVE_ABSENCES,
        severity: 'orange',
        studentId: sg.studentId,
        studentName: `${sg.student.firstName} ${sg.student.lastName}`,
        groupId: sg.groupId,
        groupName: sg.group.course.name,
        absenceCount: 2,
      })
    }
  }

  return alerts
}

// ─── Load active snoozed alerts ────────────────────────────────────────

async function getSnoozedAlertMap(organizationId: number): Promise<Map<string, Date>> {
  const snoozedAlerts = await prisma.snoozedAlert.findMany({
    where: {
      organizationId,
      snoozedUntil: { gt: new Date() },
    },
    select: { alertType: true, entityKey: true, snoozedUntil: true },
  })

  return new Map(
    snoozedAlerts.map((alert) => [`${alert.alertType}:${alert.entityKey}`, alert.snoozedUntil]),
  )
}

function buildSmartFeedPageAlert(
  alert: SmartFeedAlert,
  snoozedUntil: Date | null,
): SmartFeedPageAlert {
  return {
    ...alert,
    id: getSmartFeedAlertId(alert),
    entityKey: getSmartFeedEntityKey(alert),
    snoozedUntil,
    status: snoozedUntil ? SMART_FEED_STATUS.SNOOZED : SMART_FEED_STATUS.ACTIVE,
  }
}

async function getSmartFeedSnapshot(organizationId: number): Promise<SmartFeedPageData> {
  const [snoozedAlertMap, unmarked, balance, absences] = await Promise.all([
    getSnoozedAlertMap(organizationId),
    getUnmarkedAttendanceAlerts(organizationId),
    getBalanceAlerts(organizationId),
    getConsecutiveAbsenceAlerts(organizationId),
  ])

  const alerts = [...unmarked, ...balance, ...absences].sort(compareSmartFeedAlerts)
  const pageAlerts = alerts.map((alert) => {
    const snoozedUntil = snoozedAlertMap.get(getSmartFeedAlertId(alert))
    return buildSmartFeedPageAlert(alert, snoozedUntil ?? null)
  })

  return {
    active: pageAlerts.filter((alert) => alert.status === SMART_FEED_STATUS.ACTIVE),
    snoozed: pageAlerts.filter((alert) => alert.status === SMART_FEED_STATUS.SNOOZED),
  }
}

// ─── Main feed action ──────────────────────────────────────────────────

export const getSmartFeed = authAction
  .metadata({ actionName: 'getSmartFeed' })
  .action(async ({ ctx }) => {
    const snapshot = await getSmartFeedSnapshot(ctx.session.organizationId!)
    return snapshot.active
  })

export const getSmartFeedPageData = authAction
  .metadata({ actionName: 'getSmartFeedPageData' })
  .action(async ({ ctx }) => {
    return await getSmartFeedSnapshot(ctx.session.organizationId!)
  })

// ─── Snooze action ─────────────────────────────────────────────────────

export const snoozeAlert = authAction
  .metadata({ actionName: 'snoozeAlert' })
  .inputSchema(SnoozeAlertSchema)
  .action(async ({ ctx, parsedInput }) => {
    const organizationId = ctx.session.organizationId!
    const userId = Number(ctx.session.user.id)

    await prisma.snoozedAlert.upsert({
      where: {
        organizationId_alertType_entityKey: {
          organizationId,
          alertType: parsedInput.alertType,
          entityKey: parsedInput.entityKey,
        },
      },
      update: {
        snoozedUntil: addDays(new Date(), parsedInput.snoozeDays),
        snoozedByUserId: userId,
      },
      create: {
        organizationId,
        alertType: parsedInput.alertType,
        entityKey: parsedInput.entityKey,
        snoozedUntil: addDays(new Date(), parsedInput.snoozeDays),
        snoozedByUserId: userId,
      },
    })
  })

export const restoreSnoozedAlert = authAction
  .metadata({ actionName: 'restoreSnoozedAlert' })
  .inputSchema(RestoreSnoozedAlertSchema)
  .action(async ({ ctx, parsedInput }) => {
    await prisma.snoozedAlert.deleteMany({
      where: {
        organizationId: ctx.session.organizationId!,
        alertType: parsedInput.alertType,
        entityKey: parsedInput.entityKey,
      },
    })
  })
