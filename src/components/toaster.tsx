'use client'

import { Toaster as SonnerToaster, ToasterProps } from 'sonner'
import { useTheme } from 'next-themes'

export function Toaster() {
  const { resolvedTheme } = useTheme()

  return <SonnerToaster richColors theme={resolvedTheme as ToasterProps['theme']} />
}
