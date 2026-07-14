'use client'

import { Zap, Square, Loader2, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface GenerateButtonProps {
  isGenerating: boolean
  isDisabled: boolean
  backendDown?: boolean
  onClick: () => void
  onStop: () => void
}

export function GenerateButton({
  isGenerating,
  isDisabled,
  backendDown = false,
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

  const button = (
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
      {backendDown ? (
        <WifiOff className="w-5 h-5" />
      ) : (
        <Zap className="w-5 h-5" />
      )}
      Generate Speech
    </Button>
  )

  if (backendDown) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="w-full">{button}</span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs text-center">
            Backend is not running. Start it with:<br />
            <code className="text-xs">uv run pocket-tts serve --port 8000</code>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return button
}
