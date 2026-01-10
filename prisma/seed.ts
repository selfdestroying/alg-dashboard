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
  await prisma.$transaction(async (tx) => {
    const teacherLessons = await tx.teacherLesson.findMany({
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
      const group = tl.lesson?.group
      const groupTeacher = group?.teachers?.find((t) => t.teacherId === tl.teacherId)

      let bid = groupTeacher?.bid

      // Fallbacks when group-teacher relation doesn't contain bid
      if (bid === undefined || bid === null) {
        if (group?.type === 'GROUP') {
          bid = tl.teacher?.bidForLesson ?? 0
        } else if (group?.type === 'INDIVIDUAL') {
          bid = tl.teacher?.bidForIndividual ?? 0
        } else {
          bid = 0
        }
      }

      await tx.teacherLesson.update({
        where: {
          teacherId_lessonId: {
            teacherId: tl.teacherId,
            lessonId: tl.lessonId,
          },
        },
        data: {
          bid,
        },
      })
    }
  })
}

// generateDayOfWeek()
fillTeacherGroupBids()
fillTeacherLessonBids()
