import { getCourses } from '@/actions/courses'
import { getUserByAuth, getUsers } from '@/actions/users'
import ChristmasLights from '@/components/christmas-lights'
import { Toaster } from '@/components/toaster'
import prisma from '@/lib/prisma'
import { DataProvider } from '@/providers/data-provider'
import { ThemeProvider } from '@/providers/theme-provider'
import { Inter } from 'next/font/google'
import './globals.css'

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata = {
  title: 'ALGCORE',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const courses = await getCourses()
  const users = await getUsers({})
  const user = await getUserByAuth()
  const locations = await prisma.location.findMany()
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontSans.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          <DataProvider courses={courses} users={users} locations={locations} user={user}>
            <ChristmasLights />
            {children}
            <Toaster />
          </DataProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
