"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Mic, MicOff, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type VoiceSendMeta = {
  // TODO(BE 연동): 서버 STT 업로드용 원본 오디오
  audioBlob?: Blob | null
  // TODO(BE 연동): 업로드 메타(로그/제한 시간 검증)
  audioDurationMs?: number
}

interface VoiceInputProps {
  onSendMessage: (message: string, meta?: VoiceSendMeta) => void
  disabled?: boolean
}

function pickRecorderMime(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ]
  for (const c of candidates) {
    if (MediaRecorder.isTypeSupported(c)) return c
  }
  return undefined
}

export function VoiceInput({ onSendMessage, disabled }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [inputText, setInputText] = useState("")
  const [lastSentHint, setLastSentHint] = useState<string | null>(null)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const recordStartedAtRef = useRef<number>(0)
  const audioBlobRef = useRef<Blob | null>(null)
  const audioDurationMsRef = useRef<number>(0)

  const stopMediaRecording = useCallback(() => {
    const rec = recorderRef.current
    if (rec && rec.state !== "inactive") {
      try {
        rec.stop()
      } catch {
        streamRef.current?.getTracks().forEach((t) => t.stop())
        streamRef.current = null
        recorderRef.current = null
      }
      return
    }
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    recorderRef.current = null
  }, [])

  const startMediaRecording = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      return false
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []
      const mime = pickRecorderMime()
      const mr = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream)
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      mr.onstop = () => {
        const type = mr.mimeType || mime || "audio/webm"
        const blob = new Blob(chunksRef.current, { type })
        audioBlobRef.current = blob
        audioDurationMsRef.current = Math.max(
          0,
          Date.now() - recordStartedAtRef.current
        )
        streamRef.current?.getTracks().forEach((t) => t.stop())
        streamRef.current = null
        recorderRef.current = null
      }
      recordStartedAtRef.current = Date.now()
      mr.start(120)
      recorderRef.current = mr
      return true
    } catch {
      return false
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = "ko-KR"

      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex
        const result = event.results[current]
        const text = result[0].transcript
        setTranscript(text)
        if (result.isFinal) {
          setInputText(text)
          setIsListening(false)
          stopMediaRecording()
        }
      }

      recognitionRef.current.onerror = () => {
        setIsListening(false)
        stopMediaRecording()
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
        stopMediaRecording()
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      stopMediaRecording()
    }
  }, [stopMediaRecording])

  const toggleListening = async () => {
    if (!recognitionRef.current) {
      alert("음성 인식이 지원되지 않는 브라우저입니다.")
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
      stopMediaRecording()
    } else {
      audioBlobRef.current = null
      audioDurationMsRef.current = 0
      const ok = await startMediaRecording()
      if (!ok) {
        alert("마이크 권한이 필요합니다. 음성 녹음(STT·백엔드 전송용)에 사용됩니다.")
        return
      }
      setTranscript("")
      try {
        recognitionRef.current.start()
      } catch {
        stopMediaRecording()
        alert("음성 인식을 시작할 수 없습니다. 잠시 후 다시 시도하세요.")
        return
      }
      setIsListening(true)
    }
  }

  const handleSend = () => {
    const textToSend = inputText || transcript
    if (!textToSend.trim()) return

    const blob = audioBlobRef.current
    const durationMs = audioDurationMsRef.current
    // TODO(BE 연동): 이 콜백 이후 상위 컴포넌트에서
    // FormData(audioBlob) 업로드 및 STT/AI 평가 API 호출을 연결하세요.
    onSendMessage(textToSend.trim(), {
      audioBlob: blob ?? undefined,
      audioDurationMs: blob ? durationMs : undefined,
    })

    if (blob) {
      const sec = (durationMs / 1000).toFixed(1)
      setLastSentHint(
        `음성 녹음 ${sec}초 · ${(blob.size / 1024).toFixed(1)}KB (서버/API 연동 시 전송)`
      )
    } else {
      setLastSentHint(null)
    }

    audioBlobRef.current = null
    audioDurationMsRef.current = 0
    setInputText("")
    setTranscript("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="space-y-3">
      {isListening && (
        <div className="flex items-center justify-center gap-2 text-sm text-primary">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </span>
          <span>듣고 있습니다… (동시에 녹음 중)</span>
        </div>
      )}

      {transcript && isListening && (
        <div className="text-center text-muted-foreground italic">
          {`"${transcript}"`}
        </div>
      )}

      {lastSentHint && (
        <p className="text-center text-xs text-muted-foreground">{lastSentHint}</p>
      )}

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하거나 마이크를 누르세요"
          className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          disabled={disabled || isListening}
        />

        <Button
          variant="outline"
          size="icon"
          onClick={() => void toggleListening()}
          disabled={disabled}
          className={cn(
            "h-12 w-12 rounded-xl transition-all",
            isListening && "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
          aria-label={isListening ? "음성 인식 중지" : "음성 인식 시작"}
        >
          {isListening ? (
            <MicOff className="h-5 w-5" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </Button>

        <Button
          onClick={handleSend}
          disabled={disabled || (!inputText.trim() && !transcript.trim())}
          className="h-12 w-12 rounded-xl"
          aria-label="메시지 보내기"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
