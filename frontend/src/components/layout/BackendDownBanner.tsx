'use client'

import { AlertTriangle, RefreshCw, Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBackendHealth } from '@/hooks/useBackendHealth'

export function BackendDownBanner() {
  const { isHealthy, checking, recheck } = useBackendHealth()

  if (isHealthy || isHealthy === null) return null

  return (
    <div className="flex items-start gap-3 px-5 py-3 bg-destructive/10 border-b border-destructive/30 text-sm">
      <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-destructive">Backend is not running</p>
        <p className="text-muted-foreground mt-0.5">
          Speech generation is unavailable. Start the backend in a terminal:
        </p>
        <div className="flex items-center gap-2 mt-1.5 px-3 py-1.5 rounded bg-muted font-mono text-xs w-fit max-w-full overflow-x-auto">
          <Terminal className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />
          <span className="select-all">
            cd pocket-tts &amp;&amp; uv run pocket-tts serve --port 8000
          </span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={recheck}
        disabled={checking}
        className="flex-shrink-0 h-7 gap-1.5 text-xs"
        aria-label="Retry connection"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
        {checking ? 'Checking…' : 'Retry'}
      </Button>
    </div>
  )
}
