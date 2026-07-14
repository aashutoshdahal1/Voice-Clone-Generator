'use client'

import { useState, useRef, useCallback } from 'react'
import { toast } from 'sonner'
import { TextEditor } from '@/components/studio/TextEditor'
import { VoiceSelector } from '@/components/studio/VoiceSelector'
import { GenerateButton } from '@/components/studio/GenerateButton'
import { AudioPlayer } from '@/components/studio/AudioPlayer'
import { GenerationSettings } from '@/components/studio/GenerationSettings'
import { GeneratingOverlay } from '@/components/studio/GeneratingOverlay'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useStreamingAudio } from '@/hooks/useStreamingAudio'
import { useVoiceLibraryStore, useHistoryStore, useSettingsStore } from '@/lib/store'
import { useBackendHealth } from '@/hooks/useBackendHealth'
import { generateTTS } from '@/lib/api'
import { getVoiceById } from '@/lib/voices'
import { Wand2, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { GenerationHistoryItem } from '@/types'

function nanoid_() {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36)
}

export default function StudioPage() {
  const [text, setText] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const { state: audioState, stream, stop: stopStream, reset: resetAudio } = useStreamingAudio()
  const { selectedVoiceId, customVoiceFile, customVoiceUrl, getActiveVoiceMode } = useVoiceLibraryStore()
  const { add: addToHistory } = useHistoryStore()
  const { settings } = useSettingsStore()

  const { isHealthy } = useBackendHealth()
  const isGenerating = audioState.isStreaming

  const activeVoiceName = customVoiceFile
    ? customVoiceFile.name
    : customVoiceUrl
    ? 'Custom URL'
    : getVoiceById(selectedVoiceId)?.name ?? selectedVoiceId

  const handleGenerate = useCallback(async () => {
    if (!text.trim()) {
      toast.error('Please enter some text first.')
      return
    }

    resetAudio()
    abortRef.current = new AbortController()
    const voiceMode = getActiveVoiceMode()

    try {
      const response = await generateTTS({
        text,
        voiceId: voiceMode === 'preset' ? selectedVoiceId : undefined,
        voiceUrl: voiceMode === 'url' ? customVoiceUrl : undefined,
        voiceFile: voiceMode === 'file' ? customVoiceFile ?? undefined : undefined,
        signal: abortRef.current.signal,
      })
      await stream(response)
      toast.success('Speech generated!')
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        toast.info('Generation stopped.')
        return
      }
      const msg = err instanceof Error ? err.message : 'Generation failed'
      toast.error(msg)
    }
  }, [text, selectedVoiceId, customVoiceFile, customVoiceUrl, getActiveVoiceMode, stream, resetAudio])

  // Save to history once complete
  const prevComplete = useRef(false)
  if (!isGenerating && audioState.audioUrl && !prevComplete.current && audioState.stats) {
    prevComplete.current = true
    const voice = getVoiceById(selectedVoiceId)
    const item: GenerationHistoryItem = {
      id: nanoid_(),
      text,
      voiceName: activeVoiceName,
      language: settings.language,
      audioUrl: audioState.audioUrl,
      audioBlob: audioState.audioBlob ?? undefined,
      generatedAt: Date.now(),
      timeToFirstAudio: audioState.stats.timeToFirstAudio,
      totalTime: audioState.stats.totalTime,
      speedRatio: audioState.stats.speedRatio,
    }
    addToHistory(item)
  }
  if (isGenerating) prevComplete.current = false

  const handleStop = () => {
    abortRef.current?.abort()
    stopStream()
  }

  return (
    <div className="flex h-full">
      {/* ── Main editor ── */}
      <div className="flex-1 flex flex-col min-w-0 p-6 gap-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center">
            <Wand2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-semibold">Text to Speech</h2>
            <p className="text-xs text-muted-foreground">Streaming audio generation</p>
          </div>
        </div>

        {/* Text editor */}
        <TextEditor value={text} onChange={setText} disabled={isGenerating} />

        {/* Loading / audio output */}
        {(isGenerating || audioState.audioUrl) && (
          <Card className="animate-fade-in">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                {isGenerating && !audioState.audioUrl ? 'Generating…' : 'Generated Audio'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Show the unique loader until first audio bytes arrive */}
              {isGenerating && !audioState.audioUrl ? (
                <GeneratingOverlay voiceName={activeVoiceName} />
              ) : audioState.audioUrl ? (
                <AudioPlayer
                  audioUrl={audioState.audioUrl}
                  audioBlob={audioState.audioBlob}
                  stats={audioState.stats}
                  isStreaming={isGenerating}
                />
              ) : null}
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {audioState.error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive animate-fade-in">
            {audioState.error}
          </div>
        )}
      </div>

      {/* ── Settings sidebar ── */}
      <div className="w-80 border-l border-border bg-card/30 flex flex-col overflow-y-auto">
        <div className="p-6 space-y-6">
          <VoiceSelector />

          <Separator />

          <div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between text-muted-foreground -mx-2 px-2 h-8"
              onClick={() => setShowSettings(!showSettings)}
            >
              <span className="text-xs font-medium uppercase tracking-wider">Advanced</span>
              {showSettings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </Button>

            {showSettings && (
              <div className="mt-4 animate-slide-up">
                <GenerationSettings />
              </div>
            )}
          </div>

          <Separator />

          <GenerateButton
            isGenerating={isGenerating}
            isDisabled={!text.trim() || isHealthy === false}
            backendDown={isHealthy === false}
            onClick={handleGenerate}
            onStop={handleStop}
          />
        </div>
      </div>
    </div>
  )
}
