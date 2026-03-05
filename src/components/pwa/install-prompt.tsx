'use client'

import { useInstallPrompt } from '@/src/hooks/use-install-prompt'
import { Download, Share, X } from 'lucide-react'
import { Button } from '@/src/components/ui/button'

export function InstallPrompt() {
  const { canPrompt, isIOS, promptInstall, dismiss } = useInstallPrompt()

  if (!canPrompt) return null

  return (
    <div className="animate-in slide-in-from-bottom-4 fade-in fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm duration-300 md:left-auto md:right-6">
      <div className="ring-border/60 bg-card/95 flex flex-col gap-3 rounded-2xl p-4 shadow-xl ring-1 shadow-black/10 backdrop-blur-xl dark:shadow-black/30">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
              <Download className="text-primary size-5" />
            </div>
            <div>
              <p className="text-sm font-medium">Установить ЕДУДА</p>
              <p className="text-muted-foreground text-xs">
                {isIOS
                  ? 'Добавьте на главный экран для быстрого доступа'
                  : 'Установите приложение для удобной работы'}
              </p>
            </div>
          </div>
          <button
            onClick={dismiss}
            className="text-muted-foreground hover:text-foreground -mr-1 -mt-1 rounded-lg p-1 transition-colors"
            aria-label="Закрыть"
          >
            <X className="size-4" />
          </button>
        </div>

        {isIOS ? (
          <div className="bg-muted/50 flex items-center gap-2 rounded-xl px-3 py-2">
            <Share className="text-muted-foreground size-4 shrink-0" />
            <p className="text-muted-foreground text-xs">
              Нажмите <span className="font-medium">Поделиться</span>, затем{' '}
              <span className="font-medium">&laquo;На экран &laquo;Домой&raquo;&raquo;</span>
            </p>
          </div>
        ) : (
          <Button onClick={promptInstall} className="h-9 w-full gap-2 rounded-xl text-sm">
            <Download className="size-4" />
            Установить
          </Button>
        )}
      </div>
    </div>
  )
}
