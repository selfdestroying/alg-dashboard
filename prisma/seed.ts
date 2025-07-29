import { getRandomDate, getRandomInteger, getRandomTime } from '@/utils/random'
import { GroupType, Prisma, PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

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

export const firstNames = [
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
export const lastNames = [
  'Иванов',
  'Петров',
  'Сидоров',
  'Смирнов',
  'Кузнецов',
  'Попов',
  'Васильев',
  'Соколов',
  'Михайлов',
  'Новиков',
  'Фёдоров',
  'Морозов',
  'Волков',
  'Алексеев',
  'Лебедев',
  'Семенов',
  'Егоров',
  'Павлов',
  'Козлов',
  'Степанов',
  'Николаев',
  'Орлов',
  'Андреев',
  'Макаров',
  'Никитин',
  'Захаров',
  'Зайцев',
  'Соловьёв',
  'Борисов',
  'Яковлев',
  'Григорьев',
  'Романов',
  'Виноградов',
  'Климов',
  'Белов',
  'Тарасов',
  'Беляев',
  'Комаров',
  'Лукин',
  'Савельев',
  'Жуков',
  'Крылов',
  'Карпов',
  'Щербаков',
  'Куликов',
  'Агафонов',
  'Поляков',
  'Быков',
  'Сергеев',
  'Королёв',
  'Гусев',
  'Фролов',
  'Дьяков',
  'Герасимов',
  'Пономарёв',
  'Голубев',
  'Калинин',
  'Курочкин',
  'Горбунов',
  'Ларионов',
  'Молчанов',
  'Соболев',
  'Буров',
  'Мартынов',
  'Ершов',
  'Носков',
  'Краснов',
  'Фомин',
  'Мельников',
  'Анисимов',
  'Тимофеев',
  'Гаврилов',
  'Коновалов',
  'Данилов',
  'Сафонов',
  'Шестаков',
  'Шилов',
  'Медведев',
  'Демидов',
  'Никифоров',
  'Матвеев',
  'Горшков',
  'Овчинников',
  'Цветков',
  'Трофимов',
  'Нечаев',
  'Лыткин',
  'Устинов',
  'Брагин',
  'Грачёв',
  'Мухин',
  'Артамонов',
  'Бобров',
  'Костин',
  'Чернов',
  'Субботин',
  'Журавлёв',
  'Пахомов',
  'Прохоров',
  'Наумов',
]
async function getStudents(): Promise<Prisma.StudentCreateManyInput[]> {
  return firstNames.map((name) => ({
    firstName: name,
    lastName: lastNames[getRandomInteger(0, lastNames.length - 1)],
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
      time: getRandomTime(),
      courseId: getRandomInteger(1, 6),
    }
    groups.push(group)
  }
  return groups
}

async function getStudentGroups() {
  const studentGroups: Prisma.StudentGroupCreateManyInput[] = []
  const studentsCount = await prisma.student.count()
  const firstStudentId = (await prisma.student.findFirst())?.id as number
  const firstGroupId = (await prisma.group.findFirst())?.id as number
  const groupsCount = await prisma.group.count()
  for (let i = 1; i <= 100; i++) {
    const studentGroup = {
      studentId: getRandomInteger(firstStudentId, firstStudentId + studentsCount - 1),
      groupId: getRandomInteger(firstGroupId, firstGroupId + groupsCount - 1),
    }
    studentGroups.push(studentGroup)
  }

  return studentGroups
}

async function getPayments() {
  const payments: Prisma.PaymentCreateManyInput[] = []
  const studentsCount = await prisma.student.count()
  const firstStudentId = (await prisma.student.findFirst())?.id as number
  const firstGroupId = (await prisma.group.findFirst())?.id as number
  const groupsCount = await prisma.group.count()
  for (let i = 1; i <= 10; i++) {
    payments.push({
      studentId: getRandomInteger(firstStudentId, firstStudentId + studentsCount - 1),
      groupId: getRandomInteger(firstGroupId, firstGroupId + groupsCount - 1),
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
  if ((await prisma.user.count()) == 0) await prisma.user.createMany({ data: await getUsers() })

  if ((await prisma.course.count()) == 0)
    await prisma.course.createMany({ data: await getCourses() })

  if ((await prisma.student.count()) == 0)
    await prisma.student.createMany({ data: await getStudents() })

  if ((await prisma.group.count()) == 0) await prisma.group.createMany({ data: await getGroups() })

  if ((await prisma.studentGroup.count()) == 0)
    for (let sg of await getStudentGroups()) {
      try {
        await prisma.studentGroup.create({ data: sg })
      } catch {
        console.log('duplicate')
      }
    }

  if ((await prisma.payment.count()) == 0)
    await prisma.payment.createMany({ data: await getPayments() })

  // for (let i = 1; i <= 33; i++) {
  //   const date = new Date()
  //   date.setDate(date.getDate() + 7 * i)
  //   await prisma.lesson.create({ data: { date, time: '15:00', groupId: 7 } })
  // }

  const students = await prisma.student.findMany({ where: { groups: { some: { groupId: 7 } } } })
  students.forEach(
    async (student) =>
      await prisma.attendance.create({
        data: { lessonId: 37, studentId: student.id, status: 'UNSPECIFIED', comment: '' },
      })
  )
}

main()
