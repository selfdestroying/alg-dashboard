import { endOfDay, startOfDay } from 'date-fns'
import { fromZonedTime } from 'date-fns-tz'
import { DateRange } from 'react-day-picker'

export function getUtcRangeForLocalDays(dateRange: DateRange) {
  if (!dateRange.from || !dateRange.to) {
    throw new Error('Диапазон дат не выбран')
  }

  const timeZone = 'Europe/Moscow'

  const localStart = startOfDay(dateRange.from)

  const localEnd = endOfDay(dateRange.to)

  const startUtc = fromZonedTime(localStart, timeZone)
  const endUtc = fromZonedTime(localEnd, timeZone)

  return { startUtc, endUtc }
}
