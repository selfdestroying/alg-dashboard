import '@/src/styles/globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { InstallPrompt } from '../components/pwa/install-prompt'
import Providers from '../providers/providers'
import { SWRegister } from './sw-register'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

const APP_NAME = 'ЕДУДА'
const APP_DEFAULT_TITLE = 'ЕДУДА | Единый учёт данных'
const APP_TITLE_TEMPLATE = '%s | ЕДУДА'
const APP_DESCRIPTION = 'Единый учёт данных для образовательных организаций'

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    template: APP_TITLE_TEMPLATE,
    default: APP_DEFAULT_TITLE,
  },
  description: APP_DESCRIPTION,
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_DEFAULT_TITLE,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" suppressHydrationWarning className={inter.variable}>
      <body className={`${inter.variable} font-sans antialiased`}>
        <SWRegister />
        <NuqsAdapter>
          <Providers>
            {children}
            <InstallPrompt />
          </Providers>
        </NuqsAdapter>
      </body>
    </html>
  )
}
