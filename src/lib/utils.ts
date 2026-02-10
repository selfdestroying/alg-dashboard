import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Prisma } from '../../prisma/generated/client'

export const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
export const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || ''

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

export function getGroupName(
  group: Prisma.GroupGetPayload<{ include: { location: true; course: true } }>
) {
  return `${group.course.name} ${DaysOfWeek.short[group.dayOfWeek!]} ${group.time}`
}
