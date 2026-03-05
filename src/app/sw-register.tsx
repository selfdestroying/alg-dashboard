'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

export function SWRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        // Check for updates periodically (every 60 minutes)
        const interval = setInterval(
          () => {
            registration.update()
          },
          60 * 60 * 1000,
        )

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (!newWorker) return

          newWorker.addEventListener('statechange', () => {
            // New SW installed & there's an existing controller = update available
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              toast.info('Доступна новая версия', {
                description: 'Обновите для получения последних изменений',
                action: {
                  label: 'Обновить',
                  onClick: () => {
                    newWorker.postMessage({ type: 'SKIP_WAITING' })
                  },
                },
                duration: Infinity,
              })
            }
          })
        })

        return () => clearInterval(interval)
      })
      .catch(console.error)

    // Reload when the new service worker takes control
    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true
        window.location.reload()
      }
    })
  }, [])

  return null
}
