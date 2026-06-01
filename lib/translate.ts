"use client"

const ruCache = new Map<string, string>()

function parseGoogleTranslateResponse(data: unknown): string | null {
  if (!Array.isArray(data) || !Array.isArray(data[0])) return null
  const chunks = data[0] as unknown[]
  const out: string[] = []
  for (const chunk of chunks) {
    if (Array.isArray(chunk) && typeof chunk[0] === "string") {
      out.push(chunk[0])
    }
  }
  const merged = out.join("").trim()
  return merged || null
}

export async function translateKoToRu(text: string): Promise<string | null> {
  const input = text.trim()
  if (!input) return null

  if (ruCache.has(input)) return ruCache.get(input) ?? null

  try {
    const url =
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ko&tl=ru&dt=t&q=${encodeURIComponent(input)}`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = (await res.json()) as unknown
    const translated = parseGoogleTranslateResponse(data)
    if (translated) {
      ruCache.set(input, translated)
      return translated
    }
  } catch {
    return null
  }

  return null
}
