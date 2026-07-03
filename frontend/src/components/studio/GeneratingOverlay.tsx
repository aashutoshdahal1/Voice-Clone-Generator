'use client'

import { useEffect, useState } from 'react'

const MESSAGES = [
  'Warming up the vocal cords…',
  'Breathing life into your words…',
  'Crafting the perfect tone…',
  'Weaving sound from text…',
  'Tuning the frequencies…',
  'Almost there…',
]

export function GeneratingOverlay({ voiceName }: { voiceName: string }) {
  const [msgIndex, setMsgIndex] = useState(0)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const msg = setInterval(() => setMsgIndex(i => (i + 1) % MESSAGES.length), 2200)
    const tick = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => { clearInterval(msg); clearInterval(tick) }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center py-10 gap-6 select-none">
      {/* Animated rings */}
      <div className="relative w-20 h-20 flex items-center justify-center">
        <span className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" style={{ animationDuration: '1.6s' }} />
        <span className="absolute inset-2 rounded-full border-2 border-primary/30 animate-ping" style={{ animationDuration: '1.2s', animationDelay: '0.2s' }} />
        <span className="absolute inset-4 rounded-full border-2 border-primary/50 animate-ping" style={{ animationDuration: '1s', animationDelay: '0.4s' }} />

        {/* Centre waveform bars */}
        <div className="flex items-center gap-[3px]">
          {[10, 18, 14, 22, 16, 12, 20].map((h, i) => (
            <div
              key={i}
              className="w-[3px] rounded-full bg-primary"
              style={{
                height: `${h}px`,
                animation: `wave 1.1s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Voice name pill */}
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        <span className="text-xs font-medium text-primary">{voiceName}</span>
      </div>

      {/* Rotating message */}
      <div className="text-center space-y-1">
        <p
          key={msgIndex}
          className="text-sm font-medium text-foreground animate-fade-in"
        >
          {MESSAGES[msgIndex]}
        </p>
        <p className="text-xs text-muted-foreground tabular-nums">
          {elapsed}s elapsed
        </p>
      </div>

      {/* Progress bar — indeterminate */}
      <div className="w-48 h-1 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
          style={{ animation: 'indeterminate 1.8s ease-in-out infinite' }}
        />
      </div>

      <style>{`
        @keyframes indeterminate {
          0%   { transform: translateX(-100%) scaleX(0.4); }
          50%  { transform: translateX(60%)  scaleX(0.6); }
          100% { transform: translateX(200%) scaleX(0.4); }
        }
      `}</style>
    </div>
  )
}
