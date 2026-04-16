/** 브라우저 Speech Synthesis 헬퍼 (백엔드 TTS 연동 전 임시) */

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
