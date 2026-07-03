export type Language =
  | 'english'
  | 'english_2026-01'
  | 'english_2026-04'
  | 'french_24l'
  | 'german_24l'
  | 'portuguese_24l'
  | 'italian_24l'
  | 'spanish_24l'

export interface Voice {
  id: string
  name: string
  language: string
  description?: string
  hfUrl: string
  gender?: 'male' | 'female' | 'neutral'
  previewUrl?: string
}

export interface GenerationConfig {
  text: string
  voiceId?: string
  voiceUrl?: string
  voiceFile?: File | null
  language: Language
  temperature: number
  lsdDecodeSteps: number
}

export interface GenerationHistoryItem {
  id: string
  text: string
  voiceName: string
  language: Language
  audioUrl: string
  audioBlob?: Blob
  duration?: number
  generatedAt: number
  timeToFirstAudio?: number
  totalTime?: number
  speedRatio?: number
}

export interface SavedCharacter {
  id: string
  name: string
  description?: string
  fileName: string
  fileSize: number
  fileType: string
  fileDataUrl: string
  createdAt: number
}

export type GenerationStatus =
  | 'idle'
  | 'connecting'
  | 'generating'
  | 'streaming'
  | 'complete'
  | 'error'

export interface StreamingStats {
  timeToFirstAudio?: number
  totalTime?: number
  speedRatio?: number
}

export interface AppSettings {
  backendUrl: string
  language: Language
  defaultVoice: string
  temperature: number
  lsdDecodeSteps: number
  autoPlay: boolean
  streamingEnabled: boolean
}
