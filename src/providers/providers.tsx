'use client'

import { ReactNode } from 'react'
import { Toaster } from '../components/toaster'
import { QueryProvider } from './query-provider'
import { ThemeProvider } from './theme-provider'

type Props = {
  children: ReactNode
}

const Providers = ({ children }: Props) => {
  return (
    <ThemeProvider>
      <QueryProvider>
        {children}
        <Toaster />
      </QueryProvider>
    </ThemeProvider>
  )
}

export default Providers
