'use client'

import { useEffect, useState, useCallback } from 'react'

export interface BackendHealth {
  isHealthy: boolean | null
  checking: boolean
  recheck: () => void
}

export function useBackendHealth(): BackendHealth {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null)
  const [checking, setChecking] = useState(true)

  const check = useCallback(async () => {
    setChecking(true)
    try {
      const res = await fetch('/proxy/health', { signal: AbortSignal.timeout(4000) })
      setIsHealthy(res.ok)
    } catch {
      setIsHealthy(false)
    } finally {
      setChecking(false)
    }
  }, [])

  useEffect(() => {
    check()
    const interval = setInterval(check, 10_000)
    return () => clearInterval(interval)
  }, [check])

  return { isHealthy, checking, recheck: check }
}
