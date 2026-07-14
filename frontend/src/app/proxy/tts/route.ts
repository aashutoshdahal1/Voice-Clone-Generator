import { type NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:8000'
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 2000

async function fetchWithRetry(url: string, init: RequestInit): Promise<Response> {
  let lastError: unknown
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await fetch(url, init)
    } catch (err) {
      lastError = err
      // Only retry on connection errors (ECONNREFUSED etc.), not on HTTP errors
      const isConnectionError =
        err instanceof TypeError &&
        (err.message.includes('ECONNREFUSED') ||
          err.message.includes('fetch failed') ||
          err.message.includes('connect'))
      if (!isConnectionError || attempt === MAX_RETRIES - 1) throw err
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS))
    }
  }
  throw lastError
}

export async function POST(req: NextRequest) {
  try {
    // Parse the incoming form data, then re-post it so fetch sets the
    // correct multipart boundary automatically.
    const incoming = await req.formData()
    const outgoing = new FormData()

    for (const [key, value] of incoming.entries()) {
      outgoing.append(key, value)
    }

    const backendRes = await fetchWithRetry(`${BACKEND}/tts`, {
      method: 'POST',
      body: outgoing,
    })

    if (!backendRes.ok) {
      const text = await backendRes.text()
      let detail = text
      try {
        const json = JSON.parse(text)
        detail = json.detail ?? text
      } catch {
        // plain text — use as-is
      }
      return NextResponse.json({ error: detail }, { status: backendRes.status })
    }

    // Stream the WAV back to the browser
    return new NextResponse(backendRes.body, {
      status: 200,
      headers: {
        'content-type': 'audio/wav',
        'transfer-encoding': 'chunked',
        'cache-control': 'no-store',
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    const isConnectionError =
      err instanceof TypeError &&
      (msg.includes('ECONNREFUSED') || msg.includes('fetch failed') || msg.includes('connect'))
    const error = isConnectionError
      ? 'Backend is not running. Start it with: uv run pocket-tts serve --port 8000'
      : msg
    return NextResponse.json({ error }, { status: 502 })
  }
}
