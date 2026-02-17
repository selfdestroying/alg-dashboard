'use client'

import { useTheme } from 'next-themes'
import { ToasterProps } from 'sonner'
import { Toaster as SonnerToaster } from '../components/ui/sonner'

export function Toaster() {
  const { resolvedTheme } = useTheme()

  return (
    <SonnerToaster
      richColors
      closeButton={false}
      duration={2000}
      position="top-center"
      theme={resolvedTheme as ToasterProps['theme']}
    />
  )
}
