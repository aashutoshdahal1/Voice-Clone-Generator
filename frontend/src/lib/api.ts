export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch('/proxy/health', { signal: AbortSignal.timeout(3000) })
    return res.ok
  } catch {
    return false
  }
}

interface GenerateTTSOptions {
  text: string
  voiceId?: string
  voiceUrl?: string
  voiceFile?: File
  signal?: AbortSignal
}

export async function generateTTS(options: GenerateTTSOptions): Promise<Response> {
  const { text, voiceId, voiceUrl, voiceFile, signal } = options

  const formData = new FormData()
  formData.append('text', text)

  if (voiceFile) {
    formData.append('voice_wav', voiceFile)
  } else if (voiceUrl && voiceUrl.trim()) {
    formData.append('voice_url', voiceUrl.trim())
  } else if (voiceId) {
    formData.append('voice_url', voiceId)
  }

  const response = await fetch('/proxy/tts', {
    method: 'POST',
    body: formData,
    signal,
  })

  if (!response.ok) {
    // Try to extract the detail message forwarded from FastAPI
    let message = `Generation failed (${response.status})`
    try {
      const json = await response.json()
      if (json.error) message = json.error
    } catch {
      const text = await response.text().catch(() => '')
      if (text) message = text
    }
    throw new Error(message)
  }

  return response
}
