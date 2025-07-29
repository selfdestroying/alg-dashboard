import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export enum DayOfWeek {
  'ВСК' = 0,
  'ПН' = 1,
  'ВТ' = 2,
  'СР' = 3,
  'ЧТ' = 4,
  'ПТ' = 5,
  'СБ' = 6,
}
