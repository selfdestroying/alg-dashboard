import { DayOfWeekShort } from '@/lib/utils'

export function generateGroupName(courseName: string, startDate: Date, time: string) {
  const dayOfWeek = DayOfWeekShort[startDate.getDay()]
  return `${courseName} ${dayOfWeek} ${time}`
}
