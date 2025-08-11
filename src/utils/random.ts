export function getRandomInteger(min: number, max: number) {
  const rand = min + Math.random() * (max + 1 - min)
  return Math.floor(rand)
}

export function getRandomDate(
  start: Date = new Date(2025, 9, 1),
  end: Date = new Date(2026, 5, 29)
): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

export function getRandomTime(startHour: number = 9, endHour: number = 20): string {
  const hour = Math.floor(Math.random() * (endHour - startHour + 1)) + startHour
  const minute = Math.floor(Math.random() * 60)
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
}
