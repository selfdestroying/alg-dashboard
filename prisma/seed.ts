import prisma from '@/lib/prisma'

const generateDayOfWeek = async () => {
  await prisma.group.findMany().then(async (groups) => {
    for (const group of groups) {
      const dayOfWeek = group.startDate.getDay()
      await prisma.group.update({
        where: { id: group.id },
        data: { dayOfWeek },
      })
    }
  })
}

const fillTeacherGroupBids = async () => {
  const teacherGroups = await prisma.teacherGroup.findMany({
    where: {
      bid: 0,
    },
    include: {
      teacher: true,
      group: true,
    },
  })

  for (const tg of teacherGroups) {
    await prisma.teacherGroup.update({
      where: {
        teacherId_groupId: {
          groupId: tg.groupId,
          teacherId: tg.teacherId,
        },
      },
      data: {
        bid:
          tg.group.type === 'GROUP'
            ? tg.teacher.bidForLesson
            : tg.group.type === 'INDIVIDUAL'
              ? tg.teacher.bidForIndividual
              : 0,
      },
    })
  }
}

const fillTeacherLessonBids = async () => {
  const teacherLessons = await prisma.teacherLesson.findMany({
    where: {
      bid: 0,
    },
    include: {
      teacher: true,
      lesson: {
        include: {
          group: {
            include: {
              teachers: true,
            },
          },
        },
      },
    },
  })
  for (const tl of teacherLessons) {
    await prisma.teacherLesson.update({
      where: {
        teacherId_lessonId: {
          teacherId: tl.teacherId,
          lessonId: tl.lessonId,
        },
      },
      data: {
        bid: tl.lesson.group.teachers.find((t) => t.teacherId === tl.teacherId)?.bid,
      },
    })
  }
}

// generateDayOfWeek()
fillTeacherGroupBids()
fillTeacherLessonBids()
