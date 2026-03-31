'use server'

import prisma from '@/src/lib/db/prisma'
import { authAction } from '@/src/lib/safe-action'
import { moscowNow, normalizeDateOnly } from '@/src/lib/timezone'
import { addDays } from 'date-fns'
import { SnoozeAlertSchema } from './schemas'
import {
  ALERT_TYPE,
  type ConsecutiveAbsencesAlert,
  type LowBalanceAlert,
  type NegativeBalanceAlert,
  type SmartFeedAlert,
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
  snoozedKeys: Set<string>,
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
    take: 50,
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
    .filter((lesson) => {
      const key = `lesson:${lesson.id}`
      return !snoozedKeys.has(`${ALERT_TYPE.UNMARKED_ATTENDANCE}:${key}`)
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
  snoozedKeys: Set<string>,
): Promise<(LowBalanceAlert | NegativeBalanceAlert)[]> {
  const wallets = await prisma.wallet.findMany({
    where: {
      organizationId,
      lessonsBalance: { lte: 1 },
      studentGroups: { some: { status: { in: ['ACTIVE', 'TRIAL'] } } },
    },
    include: {
      student: true,
      studentGroups: {
        where: { status: { in: ['ACTIVE', 'TRIAL'] } },
        include: { group: { include: { course: true } } },
        take: 1,
      },
    },
  })

  const alerts: (LowBalanceAlert | NegativeBalanceAlert)[] = []

  for (const wallet of wallets) {
    const sg = wallet.studentGroups[0]
    if (!sg) continue

    const entityKey = `wallet:${wallet.id}`
    const isDebt = wallet.lessonsBalance <= 0
    const alertType = isDebt ? ALERT_TYPE.NEGATIVE_BALANCE : ALERT_TYPE.LOW_BALANCE
    if (snoozedKeys.has(`${alertType}:${entityKey}`)) continue

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
  snoozedKeys: Set<string>,
): Promise<ConsecutiveAbsencesAlert[]> {
  const today = normalizeDateOnly(moscowNow())

  // Get active student-group pairs
  const studentGroups = await prisma.studentGroup.findMany({
    where: {
      organizationId,
      status: { in: ['ACTIVE', 'TRIAL'] },
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
    const entityKey = `student:${sg.studentId}:group:${sg.groupId}`
    if (snoozedKeys.has(`${ALERT_TYPE.CONSECUTIVE_ABSENCES}:${entityKey}`)) continue

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
      select: { status: true },
    })

    if (recentAttendance.length >= 2 && recentAttendance.every((a) => a.status === 'ABSENT')) {
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

// ─── Load snoozed alert keys ───────────────────────────────────────────

async function getSnoozedKeys(organizationId: number): Promise<Set<string>> {
  const snoozed = await prisma.snoozedAlert.findMany({
    where: {
      organizationId,
      snoozedUntil: { gt: new Date() },
    },
    select: { alertType: true, entityKey: true },
  })

  return new Set(snoozed.map((s) => `${s.alertType}:${s.entityKey}`))
}

// ─── Main feed action ──────────────────────────────────────────────────

export const getSmartFeed = authAction
  .metadata({ actionName: 'getSmartFeed' })
  .action(async ({ ctx }) => {
    const organizationId = ctx.session.organizationId!
    const snoozedKeys = await getSnoozedKeys(organizationId)

    const [unmarked, balance, absences] = await Promise.all([
      getUnmarkedAttendanceAlerts(organizationId, snoozedKeys),
      getBalanceAlerts(organizationId, snoozedKeys),
      getConsecutiveAbsenceAlerts(organizationId, snoozedKeys),
    ])

    const feed: SmartFeedAlert[] = [...unmarked, ...balance, ...absences]

    // Sort by severity: red → orange → yellow
    const severityOrder = { red: 0, orange: 1, yellow: 2 }
    feed.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

    return feed
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
