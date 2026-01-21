import { clsx, type ClassValue } from 'clsx'
import { toZonedTime } from 'date-fns-tz'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const DaysOfWeek = {
  short: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  full: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
}

export function getFullName(firstName: string, lastName: string | null): string {
  return lastName ? `${firstName} ${lastName}` : firstName
}

export function getNearestWeekday(targetDay: number, fromDate = new Date(), includeToday = false) {
  const date = new Date(toZonedTime(fromDate, 'Europe/Moscow'))
  const currentDay = date.getDay()

  let diff = (targetDay - currentDay + 7) % 7

  if (!includeToday && diff === 0) {
    diff = 7
  }

  date.setDate(date.getDate() + diff)
  return date
}
