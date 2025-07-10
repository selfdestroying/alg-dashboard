import { apiGet } from "@/actions/api";
import StudentDialog from "@/components/dialogs/student-dialog";
import StudentsTable from "@/components/tables/students-table";
import { IStudent } from "@/types/student";

export default async function Page() {
  const students = await apiGet<IStudent[]>('students')
  if (!students.success)
  {
    return <div>{students.message}</div>
  }
  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <StudentDialog />
      </div>
      <div>
        <StudentsTable students={students.data} />
      </div>
    </>
  );

}
