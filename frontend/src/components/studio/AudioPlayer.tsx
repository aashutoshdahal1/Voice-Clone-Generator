'use client'

import { useRef, useState, useEffect } from 'react'
import { Play, Pause, Download, Volume2, SkipBack } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatDuration, downloadBlob } from '@/lib/utils'
import type { StreamingStats } from '@/types'

interface AudioPlayerProps {
  audioUrl: string
  audioBlob?: Blob | null
  stats?: StreamingStats | null
  isStreaming?: boolean
  className?: string
}

export function AudioPlayer({
  audioUrl,
  audioBlob,
  stats,
  isStreaming,
  className,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onDurationChange = () => setDuration(audio.duration)
    const onEnded = () => setIsPlaying(false)

    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('durationchange', onDurationChange)
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('durationchange', onDurationChange)
      audio.removeEventListener('ended', onEnded)
    }
  }, [audioUrl])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play().catch(() => {})
    }
  }

  const restart = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = 0
    audio.play().catch(() => {})
  }

  const handleSeek = (val: number[]) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = val[0]
    setCurrentTime(val[0])
  }

  const handleVolume = (val: number[]) => {
    const audio = audioRef.current
    if (!audio) return
    const v = val[0]
    audio.volume = v
    setVolume(v)
  }

  const handleDownload = () => {
    if (audioBlob) {
      downloadBlob(audioBlob, `tts-${Date.now()}.wav`)
    } else {
      const a = document.createElement('a')
      a.href = audioUrl
      a.download = `tts-${Date.now()}.wav`
      a.click()
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Waveform animation during streaming */}
      {isStreaming && (
        <div className="flex items-center justify-center gap-1 h-12">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="waveform-bar" />
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={restart}
          aria-label="Restart"
        >
          <SkipBack className="w-4 h-4" />
        </Button>

        <Button
          variant="default"
          size="icon"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="rounded-full w-10 h-10 shadow-md"
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </Button>

        {/* Time + Seek */}
        <div className="flex-1 flex items-center gap-2">
          <span className="text-xs tabular-nums text-muted-foreground w-10 shrink-0">
            {formatDuration(currentTime)}
          </span>
          <Slider
            value={[currentTime]}
            min={0}
            max={duration || 1}
            step={0.1}
            onValueChange={handleSeek}
            className="flex-1"
            aria-label="Seek"
          />
          <span className="text-xs tabular-nums text-muted-foreground w-10 shrink-0 text-right">
            {formatDuration(duration)}
          </span>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-1.5 w-24">
          <Volume2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <Slider
            value={[volume]}
            min={0}
            max={1}
            step={0.05}
            onValueChange={handleVolume}
            aria-label="Volume"
          />
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleDownload}
          aria-label="Download audio"
        >
          <Download className="w-4 h-4" />
        </Button>
      </div>

      {/* Stats */}
      {stats && !isStreaming && (
        <div className="flex flex-wrap gap-2">
          {stats.timeToFirstAudio !== undefined && (
            <Badge variant="info" className="text-xs">
              First audio: {stats.timeToFirstAudio.toFixed(2)}s
            </Badge>
          )}
          {stats.totalTime !== undefined && (
            <Badge variant="secondary" className="text-xs">
              Total: {stats.totalTime.toFixed(2)}s
            </Badge>
          )}
          {stats.speedRatio !== undefined && (
            <Badge variant="success" className="text-xs">
              {stats.speedRatio}× real-time
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
