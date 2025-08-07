import { getCourses } from '@/actions/courses'
import { getUsers } from '@/actions/users'
import { Toaster } from '@/components/toaster'
import { DataProvider } from '@/providers/data-provider'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/providers/theme-provider'

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const courses = await getCourses()
  const users = await getUsers()
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontSans.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          <DataProvider courses={courses} users={users}>
            {children}
            <Toaster />
          </DataProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
