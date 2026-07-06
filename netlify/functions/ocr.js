// Netlify Function — server-side OCR via Claude. Keeps the API key secret.
export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  const key = process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY
  if (!key) return Response.json({ amount: null, store: null, date: null, confidence: 0, error: 'no_key' })
  try {
    const { image, mediaType } = await req.json()
    if (!image) return Response.json({ amount: null, store: null, date: null, confidence: 0 })
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    const mt = allowed.includes(mediaType) ? mediaType : 'image/jpeg'
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6', max_tokens: 400,
        messages: [{ role: 'user', content: [
          { type: 'image', source: { type: 'base64', media_type: mt, data: image } },
          { type: 'text', text: 'This is a receipt, likely in Hebrew. Extract: total amount paid (ILS), business name, purchase date. Return ONLY a JSON object, no other text: {"amount": number|null, "store": string|null, "date": "YYYY-MM-DD"|null, "confidence": 0..1}. Be strict with confidence based on image clarity.' },
        ] }],
      }),
    })
    const data = await r.json()
    if (data.error) return Response.json({ amount: null, store: null, date: null, confidence: 0, error: data.error.message || data.error.type })
    const txt = data.content?.find(b => b.type === 'text')?.text || ''
    const m = txt.match(/\{[\s\S]*\}/)
    const parsed = m ? JSON.parse(m[0]) : { amount: null, store: null, date: null, confidence: 0 }
    return Response.json(parsed)
  } catch (e) {
    return Response.json({ amount: null, store: null, date: null, confidence: 0, error: String(e) })
  }
}
