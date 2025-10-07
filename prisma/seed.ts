import prisma from '@/lib/prisma'

const updateTeacherGroupLessonRelation = async () => {
  const groups = await prisma.group.findMany({ include: { lessons: true } })
  for (const group of groups) {
    await prisma.teacherGroup.create({
      data: {
        groupId: group.id,
        teacherId: group.teacherId,
      },
    })
    for (const lesson of group.lessons) {
      await prisma.teacherLesson.create({
        data: {
          lessonId: lesson.id,
          teacherId: group.teacherId,
        },
      })
    }
  }
}

updateTeacherGroupLessonRelation()
