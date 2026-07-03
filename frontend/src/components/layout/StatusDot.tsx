'use client'

import { useBackendHealth } from '@/hooks/useBackendHealth'
import { cn } from '@/lib/utils'

export function StatusDot() {
  const { isHealthy, checking } = useBackendHealth()

  return (
    <div className="relative flex-shrink-0 w-2 h-2">
      <div
        className={cn(
          'w-2 h-2 rounded-full',
          checking && 'bg-amber-400 animate-pulse',
          !checking && isHealthy && 'bg-emerald-400',
          !checking && !isHealthy && 'bg-red-400'
        )}
      />
      {!checking && isHealthy && (
        <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-60" />
      )}
    </div>
  )
}
