import { createStudent, getStudents } from '@/actions/students'
import { getUser } from '@/actions/users'
import ButtonDialog from '@/components/button-dialog'
import StudentForm from '@/components/forms/student-form'
import StudentsTable from '@/components/tables/students-table'
import { Button } from '@/components/ui/button'
import { getRandomInteger } from '@/utils/random'
import { Dices } from 'lucide-react'
import { firstNames, lastNames } from '../../../../prisma/seed'

export default async function Page() {
  const user = await getUser()
  const students = await getStudents()

  async function generateStudent() {
    'use server'
    await createStudent({
      firstName: firstNames[getRandomInteger(0, firstNames.length - 1)],
      lastName: lastNames[getRandomInteger(0, lastNames.length - 1)],
      age: getRandomInteger(6, 17),
    })
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <ButtonDialog title="Добавить ученика" submitButtonProps={{ form: 'student-form' }}>
          <StudentForm />
        </ButtonDialog>
        {user?.role == 'ADMIN' && (
          <Button size={'icon'} onClick={generateStudent}>
            <Dices />
          </Button>
        )}
      </div>
      <div>
        <StudentsTable students={students} />
      </div>
    </>
  )
}
