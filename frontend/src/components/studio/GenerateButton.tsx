'use client'

import { Zap, Square, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface GenerateButtonProps {
  isGenerating: boolean
  isDisabled: boolean
  onClick: () => void
  onStop: () => void
}

export function GenerateButton({
  isGenerating,
  isDisabled,
  onClick,
  onStop,
}: GenerateButtonProps) {
  if (isGenerating) {
    return (
      <Button
        variant="destructive"
        size="lg"
        onClick={onStop}
        className="w-full gap-2 h-12 text-base font-semibold"
      >
        <Square className="w-4 h-4 fill-current" />
        Stop Generation
      </Button>
    )
  }

  return (
    <Button
      variant="gradient"
      size="lg"
      disabled={isDisabled}
      onClick={onClick}
      className={cn(
        'w-full gap-2 h-12 text-base font-semibold',
        !isDisabled && 'animate-pulse-glow'
      )}
    >
      <Zap className="w-5 h-5" />
      Generate Speech
    </Button>
  )
}
