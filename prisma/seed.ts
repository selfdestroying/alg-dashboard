import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Курс
  const course = await prisma.course.create({
    data: { name: 'Frontend Development' },
  })

  // Учитель
  const teacher = await prisma.user.create({
    data: {
      firstName: 'Иван',
      lastName: 'Петров',
      password: 'hashed-password',
      role: 'TEACHER',
      passwordRequired: false,
    },
  })

  // Группа
  const group = await prisma.group.create({
    data: {
      name: 'Группа A',
      courseId: course.id,
      teacherId: teacher.id,
      type: 'GROUP',
      startDate: new Date('2025-01-15'),
      lessonCount: 5,
      lessonPerWeek: 2,
    },
  })

  // Студенты
  const students = await prisma.student.createMany({
    data: [
      { firstName: 'Анна', lastName: 'Иванова', login: 'anna', password: '123', age: 15 },
      { firstName: 'Петр', lastName: 'Сидоров', login: 'petr', password: '123', age: 16 },
      { firstName: 'Мария', lastName: 'Кузнецова', login: 'maria', password: '123', age: 15 },
    ],
  })

  const studentRecords = await prisma.student.findMany()

  // Привязка студентов к группе
  for (const s of studentRecords) {
    await prisma.studentGroup.create({
      data: {
        studentId: s.id,
        groupId: group.id,
      },
    })
  }

  // Уроки
  const lessons = await prisma.lesson.createMany({
    data: [
      { groupId: group.id, date: new Date('2025-02-01T10:00:00Z') },
      { groupId: group.id, date: new Date('2025-02-08T10:00:00Z') },
      { groupId: group.id, date: new Date('2025-02-15T10:00:00Z') },
    ],
  })

  const lessonRecords = await prisma.lesson.findMany()

  // Посещаемость
  await prisma.attendance.createMany({
    data: [
      // Анна
      {
        studentId: studentRecords[0].id,
        lessonId: lessonRecords[0].id,
        status: 'PRESENT',
        comment: '',
      },
      {
        studentId: studentRecords[0].id,
        lessonId: lessonRecords[1].id,
        status: 'ABSENT',
        comment: '',
      },
      {
        studentId: studentRecords[0].id,
        lessonId: lessonRecords[2].id,
        status: 'PRESENT',
        comment: '',
      },

      // Петр
      {
        studentId: studentRecords[1].id,
        lessonId: lessonRecords[0].id,
        status: 'ABSENT',
        comment: '',
      },
      {
        studentId: studentRecords[1].id,
        lessonId: lessonRecords[1].id,
        status: 'PRESENT',
        comment: '',
      },
      {
        studentId: studentRecords[1].id,
        lessonId: lessonRecords[2].id,
        status: 'PRESENT',
        comment: '',
      },

      // Мария
      {
        studentId: studentRecords[2].id,
        lessonId: lessonRecords[0].id,
        status: 'PRESENT',
        comment: '',
      },
      {
        studentId: studentRecords[2].id,
        lessonId: lessonRecords[1].id,
        status: 'PRESENT',
        comment: '',
      },
      {
        studentId: studentRecords[2].id,
        lessonId: lessonRecords[2].id,
        status: 'ABSENT',
        comment: '',
      },
    ],
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
