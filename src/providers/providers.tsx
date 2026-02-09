'use client'

import { getQueryClient } from '@/src/data/query-client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from '../components/ui/sonner'
import { ThemeProvider } from './theme-provider'

type Props = {
  children: React.ReactNode
}

const Providers = ({ children }: Props) => {
  const queryClient = getQueryClient()

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools
          client={queryClient}
          initialIsOpen={false}
          buttonPosition="bottom-right"
          position="bottom"
        />
        {children}
        <Toaster richColors />
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default Providers
