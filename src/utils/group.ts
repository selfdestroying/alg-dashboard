export function generateGroupName(courseName: string, dayOfWeek: string, time: string) {
  return `${courseName} ${dayOfWeek} ${time}`
}
