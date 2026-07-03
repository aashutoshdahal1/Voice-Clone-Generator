'use client'

import { useCallback, useRef, useState } from 'react'
import type { StreamingStats } from '@/types'

export interface StreamingAudioState {
  // true while fetching + Web Audio is still playing
  isStreaming: boolean
  stats: StreamingStats | null
  audioBlob: Blob | null
  // only set once Web Audio has fully finished — triggers the <audio> player
  audioUrl: string | null
  error: string | null
}

export function useStreamingAudio() {
  const [state, setState] = useState<StreamingAudioState>({
    isStreaming: false,
    stats: null,
    audioBlob: null,
    audioUrl: null,
    error: null,
  })

  const audioContextRef = useRef<AudioContext | null>(null)
  const playerRef = useRef<StreamingWavPlayer | null>(null)
  const startTimeRef = useRef<number>(0)
  const firstAudioTimeRef = useRef<number | null>(null)
  const chunksRef = useRef<Uint8Array[]>([])

  const stop = useCallback(() => {
    playerRef.current?.stop()
    playerRef.current = null
    audioContextRef.current?.close().catch(() => {})
    audioContextRef.current = null
  }, [])

  const reset = useCallback(() => {
    stop()
    setState((s) => {
      if (s.audioUrl) URL.revokeObjectURL(s.audioUrl)
      return { isStreaming: false, stats: null, audioBlob: null, audioUrl: null, error: null }
    })
    chunksRef.current = []
    firstAudioTimeRef.current = null
  }, [stop])

  const stream = useCallback(
    async (response: Response) => {
      reset()
      startTimeRef.current = performance.now()
      chunksRef.current = []
      setState((s) => ({ ...s, isStreaming: true, error: null }))

      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({
          latencyHint: 'playback',
        })
        audioContextRef.current = ctx

        const player = new StreamingWavPlayer(ctx, () => {
          // called once on first audio chunk
          if (!firstAudioTimeRef.current) {
            firstAudioTimeRef.current = performance.now()
          }
        })
        playerRef.current = player

        // Read the full stream
        const reader = response.body!.getReader()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          if (value) {
            chunksRef.current.push(value)
            player.addChunk(value)
          }
        }

        // Flush any remaining PCM that was below minBufferSize
        player.flush()

        // How long until Web Audio will finish playing all scheduled buffers
        const webAudioEndsAt = player.getEndTime()   // ctx.currentTime seconds
        const remainingMs = Math.max(0, (webAudioEndsAt - ctx.currentTime) * 1000)

        // Build the blob & stats now (cheap)
        const totalBlob = new Blob(chunksRef.current as BlobPart[], { type: 'audio/wav' })
        const totalTime = (performance.now() - startTimeRef.current) / 1000
        const audioUrl = URL.createObjectURL(totalBlob)

        const stats: StreamingStats = {
          timeToFirstAudio: firstAudioTimeRef.current
            ? (firstAudioTimeRef.current - startTimeRef.current) / 1000
            : undefined,
          totalTime,
        }

        // Derive duration from the blob
        const tempAudio = new Audio(audioUrl)
        await new Promise<void>((resolve) => {
          tempAudio.addEventListener('loadedmetadata', () => {
            if (tempAudio.duration > 0) {
              stats.speedRatio = parseFloat((tempAudio.duration / totalTime).toFixed(1))
            }
            resolve()
          })
          tempAudio.addEventListener('error', () => resolve())
        })

        // Wait for Web Audio to finish playing before switching to the <audio> player
        // so there's no "double audio" or sudden position-0 glitch
        if (remainingMs > 50) {
          await new Promise((r) => setTimeout(r, remainingMs + 80))
        }

        // Close the Web Audio context cleanly then surface the player
        await ctx.close().catch(() => {})
        audioContextRef.current = null

        setState({ isStreaming: false, stats, audioBlob: totalBlob, audioUrl, error: null })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Streaming failed'
        setState((s) => ({ ...s, isStreaming: false, error: message }))
      }
    },
    [reset]
  )

  return { state, stream, stop, reset }
}

class StreamingWavPlayer {
  private ctx: AudioContext
  private sampleRate = 0
  private numChannels = 0
  private headerParsed = false
  private headerBuffer = new Uint8Array(44)
  private headerBytesReceived = 0
  private nextStartTime = 0
  private pcmData = new Uint8Array(0)
  private readonly minBufferSize = 8192
  private firstAudioFired = false
  private onFirstAudio: () => void

  constructor(ctx: AudioContext, onFirstAudio: () => void) {
    this.ctx = ctx
    this.onFirstAudio = onFirstAudio
  }

  /** Returns the ctx time at which the last scheduled buffer ends. */
  getEndTime() {
    return this.nextStartTime
  }

  private parseWavHeader(header: Uint8Array) {
    const view = new DataView(header.buffer)
    this.numChannels = view.getUint16(22, true)
    this.sampleRate = view.getUint32(24, true)
    this.headerParsed = true
  }

  private appendPcm(data: Uint8Array) {
    const next = new Uint8Array(this.pcmData.length + data.length)
    next.set(this.pcmData)
    next.set(data, this.pcmData.length)
    this.pcmData = next
  }

  private scheduleBuffer(pcm: Uint8Array) {
    const bytesPerSample = this.numChannels * 2
    const samples = Math.floor(pcm.length / bytesPerSample)
    if (samples === 0) return

    const buf = this.ctx.createBuffer(this.numChannels, samples, this.sampleRate)
    const int16 = new Int16Array(pcm.buffer, pcm.byteOffset, samples * this.numChannels)

    for (let ch = 0; ch < this.numChannels; ch++) {
      const channelData = buf.getChannelData(ch)
      for (let i = 0; i < samples; i++) {
        channelData[i] = int16[i * this.numChannels + ch] / 32768
      }
    }

    const source = this.ctx.createBufferSource()
    source.buffer = buf
    source.connect(this.ctx.destination)

    const now = this.ctx.currentTime
    const start = Math.max(now, this.nextStartTime)
    source.start(start)
    this.nextStartTime = start + buf.duration

    if (!this.firstAudioFired) {
      this.firstAudioFired = true
      this.onFirstAudio()
    }
  }

  private tryPlay() {
    if (!this.headerParsed || this.pcmData.length < this.minBufferSize) return

    const bytesPerSample = this.numChannels * 2
    const samples = Math.floor(this.pcmData.length / bytesPerSample)
    const bytes = samples * bytesPerSample

    const slice = this.pcmData.slice(0, bytes)
    this.pcmData = this.pcmData.slice(bytes)
    this.scheduleBuffer(slice)

    if (this.pcmData.length >= this.minBufferSize) {
      setTimeout(() => this.tryPlay(), 10)
    }
  }

  /** Play any remaining PCM regardless of minBufferSize. */
  flush() {
    if (!this.headerParsed || this.pcmData.length === 0) return
    const bytesPerSample = this.numChannels * 2
    const samples = Math.floor(this.pcmData.length / bytesPerSample)
    if (samples === 0) return
    const bytes = samples * bytesPerSample
    const slice = this.pcmData.slice(0, bytes)
    this.pcmData = new Uint8Array(0)
    this.scheduleBuffer(slice)
  }

  addChunk(chunk: Uint8Array) {
    if (!this.headerParsed) {
      const needed = 44 - this.headerBytesReceived
      const copy = Math.min(needed, chunk.length)
      this.headerBuffer.set(chunk.slice(0, copy), this.headerBytesReceived)
      this.headerBytesReceived += copy

      if (this.headerBytesReceived >= 44) {
        this.parseWavHeader(this.headerBuffer)
        if (chunk.length > copy) this.appendPcm(chunk.slice(copy))
      }
    } else {
      this.appendPcm(chunk)
    }
    this.tryPlay()
  }

  stop() {
    this.ctx.close().catch(() => {})
  }
}
