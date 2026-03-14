import { Hint } from '@/src/components/hint'
import { Badge } from '@/src/components/ui/badge'
import { getGroupName } from '@/src/lib/utils'
import { BarChart3, CheckCircle2, RefreshCw, XCircle } from 'lucide-react'
import { StudentWithGroupsAndAttendance } from './types'

export interface GroupStats {
  groupId: number
  groupName: string
  isInactive: boolean
  totalLessons: number
  attended: number
  madeUp: number
  missed: number
}

export function computeGroupStats(student: StudentWithGroupsAndAttendance): GroupStats[] {
  const groupStats = new Map<number, GroupStats>()
  const currentGroupIds = new Set(student.groups.map((sg) => sg.group.id))

  // Step 1: Register current groups with their full lesson counts
  for (const sg of student.groups) {
    const { group } = sg
    groupStats.set(group.id, {
      groupId: group.id,
      groupName: getGroupName(group),
      isInactive: false,
      totalLessons: group.lessons.length,
      attended: 0,
      madeUp: 0,
      missed: 0,
    })
  }

  // Step 2: Derive dismissed/transferred groups from attendances
  for (const att of student.attendances) {
    const groupId = att.lesson.groupId
    if (currentGroupIds.has(groupId) || att.asMakeupFor) continue

    if (!groupStats.has(groupId)) {
      const group = att.lesson.group
      groupStats.set(groupId, {
        groupId,
        groupName: getGroupName(group),
        isInactive: true,
        totalLessons: group._count.lessons,
        attended: 0,
        madeUp: 0,
        missed: 0,
      })
    }
  }

  // Step 3: Count attendance statuses per group
  for (const att of student.attendances) {
    if (att.studentStatus === 'TRIAL') continue

    const groupId = att.lesson.groupId
    const isMakeup = !!att.asMakeupFor

    // For makeup attendance, attribute it to the original missed group
    const targetGroupId = isMakeup ? att.asMakeupFor!.missedAttendanceId : null
    let statsGroupId = groupId

    if (isMakeup) {
      // Find the original missed attendance's group from all attendances
      const missedAtt = student.attendances.find((a) => a.id === targetGroupId && a.missedMakeup)
      if (missedAtt) {
        statsGroupId = missedAtt.lesson.groupId
      } else if (!groupStats.has(groupId)) {
        continue
      }
    }

    const stats = groupStats.get(statsGroupId)
    if (!stats) continue

    if (!isMakeup) {
      if (att.status === 'PRESENT') {
        stats.attended++
      } else if (att.status === 'ABSENT') {
        stats.missed++
        if (att.missedMakeup?.makeUpAttendance.status === 'PRESENT') {
          stats.madeUp++
        }
      }
    }
  }

  // Sort: current groups first, then inactive
  return Array.from(groupStats.values()).sort((a, b) => {
    if (a.isInactive !== b.isInactive) return a.isInactive ? 1 : -1
    return a.groupName.localeCompare(b.groupName)
  })
}

export default function CourseAttendanceStats({
  student,
}: {
  student: StudentWithGroupsAndAttendance
}) {
  const stats = computeGroupStats(student)

  if (stats.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-muted-foreground flex items-center gap-2 text-lg font-semibold">
          <BarChart3 size={20} />
          Статистика посещаемости
        </h3>
        <p className="text-muted-foreground">Нет данных о посещаемости.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-muted-foreground flex items-center gap-2 text-lg font-semibold">
        <BarChart3 size={20} />
        Статистика посещаемости
        <Hint text="Процент посещаемости = (посещения + отработки) / всего уроков. Зелёная галочка — посещено, синяя стрелка — отработано, красный крестик — пропущено." />
      </h3>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((group) => {
          const attendanceRate =
            group.totalLessons > 0
              ? Math.round(((group.attended + group.madeUp) / group.totalLessons) * 100)
              : 0

          return (
            <div
              key={group.groupId}
              className="bg-muted/50 flex items-center justify-between gap-3 rounded-md border px-3 py-2"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="truncate text-sm font-medium">{group.groupName}</span>
                {group.isInactive && (
                  <Badge variant="outline" className="shrink-0 px-1.5 py-0 text-[10px]">
                    не активна
                  </Badge>
                )}
                <Badge
                  variant={attendanceRate >= 80 ? 'default' : 'destructive'}
                  className="shrink-0 px-1.5 py-0 text-[10px]"
                >
                  {attendanceRate}%
                </Badge>
              </div>
              <div className="text-muted-foreground flex shrink-0 items-center gap-2.5 text-xs">
                <span className="flex items-center gap-0.5" title="Посещено">
                  <CheckCircle2 size={12} className="text-green-500" />
                  {group.attended}
                </span>
                <span className="flex items-center gap-0.5" title="Отработано">
                  <RefreshCw size={12} className="text-blue-500" />
                  {group.madeUp}
                </span>
                <span className="flex items-center gap-0.5" title="Пропущено">
                  <XCircle size={12} className="text-red-500" />
                  {group.missed}
                </span>
                <span className="text-foreground font-medium" title="Всего занятий">
                  {group.totalLessons}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
