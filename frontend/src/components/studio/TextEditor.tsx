'use client'

import { useRef } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

const MAX_CHARS = 12000

interface TextEditorProps {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
  placeholder?: string
}

export function TextEditor({ value, onChange, disabled, placeholder }: TextEditorProps) {
  const count = value.length
  const pct = Math.min(100, (count / MAX_CHARS) * 100)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Text</span>
        <div className="flex items-center gap-2">
          {count > 0 && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onChange('')}
              disabled={disabled}
              aria-label="Clear text"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          )}
          <Badge
            variant={count > MAX_CHARS * 0.9 ? 'warning' : 'secondary'}
            className="tabular-nums"
          >
            {count.toLocaleString()} / {MAX_CHARS.toLocaleString()}
          </Badge>
        </div>
      </div>

      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, MAX_CHARS))}
          disabled={disabled}
          placeholder={
            placeholder ??
            'Enter the text you want to convert to speech...\n\nTip: Longer texts are streamed in real-time — no need to wait for the full generation to start listening.'
          }
          className={cn(
            'min-h-[200px] text-base leading-relaxed transition-all duration-200',
            'focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]',
            disabled && 'opacity-50'
          )}
          aria-label="Text to convert to speech"
        />

        {/* Character progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-lg overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-300',
              pct < 80 ? 'bg-primary/30' : pct < 95 ? 'bg-amber-400' : 'bg-red-400'
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
