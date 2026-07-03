import { type NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:8000'

export async function POST(req: NextRequest) {
  try {
    // Parse the incoming form data, then re-post it so fetch sets the
    // correct multipart boundary automatically.
    const incoming = await req.formData()
    const outgoing = new FormData()

    for (const [key, value] of incoming.entries()) {
      outgoing.append(key, value)
    }

    const backendRes = await fetch(`${BACKEND}/tts`, {
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
    const message = err instanceof Error ? err.message : 'Proxy error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
