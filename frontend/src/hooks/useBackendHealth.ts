'use client'

import { useEffect, useState } from 'react'
import { checkHealth } from '@/lib/api'

export function useBackendHealth() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null)
  const [checking, setChecking] = useState(true)

  const check = async () => {
    setChecking(true)
    const ok = await checkHealth()
    setIsHealthy(ok)
    setChecking(false)
  }

  useEffect(() => {
    check()
    const interval = setInterval(check, 30_000)
    return () => clearInterval(interval)
  }, [])

  return { isHealthy, checking, recheck: check }
}
