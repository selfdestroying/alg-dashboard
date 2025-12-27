import prisma from "@/lib/prisma";
import UsersTable from "./_components/users-table";
import { Button } from "@/components/ui/button";

export default async function Page() {
    const users = await prisma.user.findMany({
        omit: {
            password: true,
            passwordRequired: true
        }
    })

    return <>
        <Button size={'sm'}>
            Добавить пользователя
        </Button>
        <UsersTable users={users} />
    </>
}