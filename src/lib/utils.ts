import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const DaysOfWeek = {
  long: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
  short: ['ВСК', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'],
}

export enum DayOfWeekShort {
  'ВСК' = 0,
  'ПН' = 1,
  'ВТ' = 2,
  'СР' = 3,
  'ЧТ' = 4,
  'ПТ' = 5,
  'СБ' = 6,
}

export enum DayOfWeekLong {
  'Воскресенье' = 0,
  'Понедельник' = 1,
  'Вторник' = 2,
  'Среда' = 3,
  'Четверг' = 4,
  'Пятница' = 5,
  'Суббота' = 6,
}
