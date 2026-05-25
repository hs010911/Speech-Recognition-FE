export function cancelSpeech(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel()
  }
}

export function speakText(text: string, lang: "ko-KR" | "ru-RU" | "en-US"): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !text.trim()) {
    return
  }
  cancelSpeech()
  const u = new SpeechSynthesisUtterance(text.trim())
  u.lang = lang
  u.rate = lang === "ru-RU" ? 0.95 : 1
  window.speechSynthesis.speak(u)
}

export type SpeechRecognitionCallbacks = {
  onTranscript: (text: string, isFinal: boolean) => void
  onError?: (message: string) => void
  onEnd?: () => void
}

export type SpeechRecognitionSession = {
  stop: () => void
  abort: () => void
}

function getSpeechRecognitionConstructor(): (new () => SpeechRecognition) | null {
  if (typeof window === "undefined") return null
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognition
    webkitSpeechRecognition?: new () => SpeechRecognition
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognitionConstructor() !== null
}

export function startSpeechRecognition(
  callbacks: SpeechRecognitionCallbacks,
  lang = "ko-KR"
): SpeechRecognitionSession | null {
  const Ctor = getSpeechRecognitionConstructor()
  if (!Ctor) return null

  const recognition = new Ctor()
  recognition.lang = lang
  recognition.continuous = true
  recognition.interimResults = true
  recognition.maxAlternatives = 1

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    let finalPart = ""
    let interimPart = ""
    for (let i = 0; i < event.results.length; i += 1) {
      const result = event.results[i]
      const transcript = result[0]?.transcript ?? ""
      if (result.isFinal) finalPart += transcript
      else interimPart += transcript
    }
    const combined = (finalPart + interimPart).trim()
    if (!combined) return
    const isFinal = event.results[event.results.length - 1]?.isFinal ?? false
    callbacks.onTranscript(combined, isFinal)
  }

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    if (event.error === "aborted") return
    const msg =
      event.error === "not-allowed"
        ? "마이크 권한이 거부되었습니다."
        : event.error === "no-speech"
          ? "음성이 감지되지 않았습니다. 다시 말해 주세요."
          : `음성 인식 오류: ${event.error}`
    callbacks.onError?.(msg)
  }

  recognition.onend = () => {
    callbacks.onEnd?.()
  }

  try {
    recognition.start()
  } catch {
    callbacks.onError?.("음성 인식을 시작할 수 없습니다.")
    return null
  }

  return {
    stop: () => {
      try {
        recognition.stop()
      } catch {
        /* ignore */
      }
    },
    abort: () => {
      try {
        recognition.abort()
      } catch {
        /* ignore */
      }
    },
  }
}
