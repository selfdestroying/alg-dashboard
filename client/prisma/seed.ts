import { GroupType, Prisma, PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

function getRandomInteger(min: number, max: number) {
  // случайное число от min до (max+1)
  let rand = min + Math.random() * (max + 1 - min)
  return Math.floor(rand)
}

function getRandomDate(
  start: Date = new Date(2025, 9, 1),
  end: Date = new Date(2026, 5, 29)
): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function getRandomTime(startHour: number = 9, endHour: number = 20): string {
  const hour = Math.floor(Math.random() * (endHour - startHour + 1)) + startHour
  const minute = Math.floor(Math.random() * 60)
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
}

async function getUsers(): Promise<Prisma.UserCreateManyInput[]> {
  return [
    {
      firstName: 'Максим',
      password: await bcrypt.hash('admin', 10),
      role: 'ADMIN',
      passwordRequired: true,
    },
    {
      firstName: 'Саша',
      password: await bcrypt.hash('owner', 10),
      role: 'OWNER',
      passwordRequired: true,
    },
    {
      firstName: 'Настя',
      password: await bcrypt.hash('owner', 10),
      role: 'OWNER',
      passwordRequired: true,
    },
    {
      firstName: 'Рита',
      password: await bcrypt.hash('manager', 10),
      role: 'MANAGER',
      passwordRequired: true,
    },
    {
      firstName: 'Маша',
      password: await bcrypt.hash('manager', 10),
      role: 'MANAGER',
      passwordRequired: true,
    },
    {
      firstName: 'Наташа',
      password: await bcrypt.hash('teacher', 10),
      role: 'TEACHER',
      passwordRequired: false,
    },
    {
      firstName: 'Федя',
      password: await bcrypt.hash('teacher', 10),
      role: 'TEACHER',
      passwordRequired: false,
    },
  ]
}

async function getStudents(): Promise<Prisma.StudentCreateManyInput[]> {
  const names = [
    'Алексей',
    'Мария',
    'Иван',
    'Екатерина',
    'Павел',
    'Анна',
    'Сергей',
    'Ольга',
    'Дмитрий',
    'Наталья',
    'Андрей',
    'Елена',
    'Михаил',
    'Татьяна',
    'Владимир',
    'Ирина',
    'Никита',
    'Светлана',
    'Юрий',
    'Людмила',
    'Артур',
    'Алёна',
    'Роман',
    'Вероника',
    'Евгений',
    'Дарья',
    'Борис',
    'Анастасия',
    'Олег',
    'Ксения',
    'Григорий',
    'Марина',
    'Тимофей',
    'Яна',
    'Константин',
    'Зоя',
    'Леонид',
    'Полина',
    'Виктор',
    'Нина',
    'Степан',
    'Лариса',
    'Георгий',
    'Валентина',
    'Руслан',
    'Жанна',
    'Василий',
    'Вера',
    'Арсений',
    'Оксана',
    'Матвей',
    'Галина',
    'Антон',
    'Евгения',
    'Максим',
    'Юлия',
    'Кирилл',
    'Любовь',
    'Ярослав',
    'Валерия',
    'Илья',
    'Алиса',
    'Станислав',
    'Агата',
    'Николай',
    'Виолетта',
    'Игнат',
    'Эльвира',
    'Тарас',
    'Инна',
    'Пётр',
    'Карина',
    'Даниил',
    'Милана',
    'Виталий',
    'Диана',
    'Артемий',
    'Есения',
    'Семён',
    'Любава',
    'Геннадий',
    'Ульяна',
    'Захар',
    'Василиса',
    'Лев',
    'Марфа',
    'Эдуард',
    'Софья',
    'Владислав',
    'Аделина',
    'Родион',
    'Арина',
    'Святослав',
    'Ярослава',
    'Прохор',
    'Снежана',
    'Богдан',
    'Кристина',
    'Тимур',
    'Ангелина',
  ]
  return names.map((name) => ({
    firstName: name,
    age: getRandomInteger(6, 17),
  }))
}

async function getGroups() {
  const groups: Prisma.GroupCreateManyInput[] = []
  for (let i = 1; i <= 10; i++) {
    const date = getRandomDate()
    const group = {
      name: `Группа №${i}`,
      type: ['GROUP', 'INDIVIDUAL', 'INTENSIVE'][getRandomInteger(0, 2)] as GroupType,
      teacherId: getRandomInteger(1, 7),
      startDate: date,
      dayOfWeek: date.getDay(),
      time: getRandomTime(),
      courseId: getRandomInteger(1, 6),
    }
    groups.push(group)
  }
  return groups
}

async function getPayments() {
  const payments: Prisma.PaymentCreateManyInput[] = []
  for (let i = 1; i <= 10; i++) {
    payments.push({
      groupId: getRandomInteger(1, 10),
      studentId: getRandomInteger(1, 100),
      lessonsPaid: getRandomInteger(0, 32),
    })
  }
  return payments
}

async function getCourses() {
  const courses: Prisma.CourseCreateManyInput[] = [
    {
      name: 'Python Start 1',
    },
    {
      name: 'Python Start 2',
    },
    {
      name: 'Python Pro 1',
    },
    {
      name: 'Python Pro 2',
    },
    {
      name: 'Visual Programming',
    },
    {
      name: 'Unity',
    },
  ]
  return courses
}

export async function main() {
  if ((await prisma.user.count()) == 0)
    for (const u of await getUsers()) {
      await prisma.user.create({ data: u })
    }
  if ((await prisma.student.count()) == 0)
    for (const s of await getStudents()) {
      await prisma.student.create({ data: s })
    }
  if ((await prisma.course.count()) == 0)
    for (const c of await getCourses()) {
      await prisma.course.create({ data: c })
    }
  if ((await prisma.group.count()) == 0)
    for (const g of await getGroups()) {
      await prisma.group.create({ data: g })
    }
  if ((await prisma.payment.count()) == 0)
    for (const p of await getPayments()) {
      await prisma.payment.create({ data: p })
    }
}

main()
