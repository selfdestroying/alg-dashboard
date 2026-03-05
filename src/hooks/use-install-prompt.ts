'use client'

import { useCallback, useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

const DISMISSED_KEY = 'pwa-install-dismissed'

function getInitialInstalled() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(display-mode: standalone)').matches
}

function getInitialDismissed() {
  if (typeof window === 'undefined') return false
  const dismissedAt = localStorage.getItem(DISMISSED_KEY)
  if (!dismissedAt) return false
  const daysSince = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24)
  if (daysSince < 7) return true
  localStorage.removeItem(DISMISSED_KEY)
  return false
}

function getInitialIsIOS() {
  if (typeof window === 'undefined') return false
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
  )
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(getInitialInstalled)
  const [isDismissed, setIsDismissed] = useState(getInitialDismissed)
  const [isIOS] = useState(getInitialIsIOS)

  useEffect(() => {
    if (isInstalled || isDismissed) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    const installedHandler = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', installedHandler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', installedHandler)
    }
  }, [isInstalled, isDismissed])

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false

    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    return outcome === 'accepted'
  }, [deferredPrompt])

  const dismiss = useCallback(() => {
    setIsDismissed(true)
    localStorage.setItem(DISMISSED_KEY, String(Date.now()))
  }, [])

  const canPrompt = !isInstalled && !isDismissed && (!!deferredPrompt || isIOS)

  return { canPrompt, isIOS, isInstalled, promptInstall, dismiss }
}
