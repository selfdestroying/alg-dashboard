import { getGroups } from '@/src/actions/groups'
import {
  getStudent,
  getStudentGroupHistory,
  getStudentLessonsBalanceHistory,
} from '@/src/actions/students'
import { FeatureGate } from '@/src/components/feature-gate'
import { Avatar, AvatarFallback } from '@/src/components/ui/avatar'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import WalletsSection from '@/src/features/wallets/components/wallets-section'
import { auth } from '@/src/lib/auth/server'
import { getFullName, protocol, rootDomain } from '@/src/lib/utils'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import CourseAttendanceStats from './_components/course-attendance-stats'
import EditStudentDialog from './_components/edit-student-dialog'
import GroupHistory from './_components/group-history'
import LessonsBalanceHistory from './_components/lessons-balance-history'
import PaymentSection from './_components/payment-section'

import ParentsSection from './_components/parents-section'
import ShopSection from './_components/shop-section'
import StudentAccountSection from './_components/student-account-section'
import StudentCard from './_components/student-card'
import StudentGroupsSection from './_components/student-groups-section'

export const metadata = { title: 'Карточка ученика' }

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({
    headers: requestHeaders,
  })
  if (!session || !session.organizationId) {
    redirect(`${protocol}://auth.${rootDomain}/sign-in`)
  }
  const { id } = await params
  const studentId = Number(id)

  const [
    student,
    groups,
    lessonsBalanceHistory,
    groupHistory,
    { success: canEdit },
    { success: canEditLessonsHistory },
    { success: canCreateStudentGroup },
  ] = await Promise.all([
    getStudent({
      where: { id: studentId, organizationId: session.organizationId! },
      include: {
        account: true,
        parents: { include: { parent: true } },
        groups: {
          include: {
            group: {
              include: {
                lessons: {
                  include: {
                    attendance: {
                      where: { studentId },
                      include: {
                        makeupAttendance: {
                          include: { lesson: true },
                        },
                      },
                    },
                  },
                  orderBy: { date: 'asc' },
                },
                course: true,
                location: true,
                schedules: true,
              },
            },
          },
        },
        wallets: {
          include: {
            studentGroups: {
              include: {
                group: { include: { course: true, location: true, schedules: true } },
              },
            },
          },
        },
        attendances: {
          include: {
            lesson: {
              include: {
                group: {
                  include: {
                    course: true,
                    schedules: true,
                    _count: { select: { lessons: true } },
                  },
                },
              },
            },
            makeupForAttendance: true,
            makeupAttendance: { include: { makeupForAttendance: true } },
          },
        },
      },
    }),
    getGroups({
      where: {
        students: { none: { studentId } },
        organizationId: session.organizationId!,
        isArchived: false,
      },
      include: {
        students: { where: { status: { in: ['ACTIVE', 'TRIAL'] } } },
        course: true,
        location: true,
        schedules: true,
        groupType: { include: { rate: true } },
        teachers: {
          include: {
            teacher: true,
          },
        },
      },
      orderBy: [{ startDate: 'asc' }],
    }),
    getStudentLessonsBalanceHistory(studentId, 50),
    getStudentGroupHistory(studentId, session.organizationId!),
    auth.api.hasPermission({
      headers: requestHeaders,
      body: { permissions: { student: ['update'] } },
    }),
    auth.api.hasPermission({
      headers: requestHeaders,
      body: { permissions: { lessonStudentHistory: ['update'] } },
    }),
    auth.api.hasPermission({
      headers: requestHeaders,
      body: { permissions: { studentGroup: ['create'] } },
    }),
  ])

  if (!student) return <div>Ошибка при получении ученика</div>

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1">
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarFallback>
                  {student.firstName?.[0]?.toUpperCase()}
                  {student.lastName?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {getFullName(student.firstName, student.lastName)}
            </div>
          </CardTitle>
          {canEdit && (
            <CardAction>
              <EditStudentDialog student={student} />
            </CardAction>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          <StudentCard student={student} />
          <ParentsSection studentId={student.id} parents={student.parents} canEdit={canEdit} />
          <StudentAccountSection account={student.account} />
          <FeatureGate feature="shop">
            {student.account && (
              <ShopSection coins={student.account.coins} studentId={student.id} />
            )}
          </FeatureGate>
          <FeatureGate feature="finances">
            <PaymentSection student={student} />
            <WalletsSection student={student} />
          </FeatureGate>
          <StudentGroupsSection
            student={student}
            groups={groups}
            canCreateStudentGroup={canCreateStudentGroup}
          />
          <CourseAttendanceStats student={student} />

          <GroupHistory history={groupHistory} />
          <FeatureGate feature="finances">
            {canEditLessonsHistory && <LessonsBalanceHistory history={lessonsBalanceHistory} />}
          </FeatureGate>
        </CardContent>
      </Card>
    </div>
  )
}
