"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Mic, MicOff, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  isSpeechRecognitionSupported,
  startSpeechRecognition,
  type SpeechRecognitionSession,
} from "@/lib/speech"

interface VoiceInputProps {
  onSendMessage: (message: string) => Promise<void> | void
  disabled?: boolean
}

export function VoiceInput({ onSendMessage, disabled }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [inputText, setInputText] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [sttHint, setSttHint] = useState<string | null>(null)
  const [sttSupported] = useState(() => isSpeechRecognitionSupported())

  const recognitionRef = useRef<SpeechRecognitionSession | null>(null)
  const committedRef = useRef("")

  const stopRecognition = useCallback(() => {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setIsListening(false)
  }, [])

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort()
      recognitionRef.current = null
    }
  }, [])

  const toggleListening = () => {
    if (isListening) {
      stopRecognition()
      return
    }

    if (!sttSupported) {
      alert(
        "이 브라우저는 Web Speech API(음성 인식)를 지원하지 않습니다. Chrome 또는 Edge를 사용하거나, 텍스트로 입력해 주세요."
      )
      return
    }

    setSttHint(null)
    committedRef.current = inputText.trim() ? `${inputText.trim()} ` : ""

    const session = startSpeechRecognition({
      onTranscript: (text, isFinal) => {
        if (isFinal) {
          committedRef.current = `${committedRef.current}${text}`.trim()
          if (committedRef.current) committedRef.current += " "
        }
        const display = isFinal
          ? committedRef.current.trim()
          : `${committedRef.current}${text}`.trim()
        setInputText(display)
      },
      onError: (message) => {
        setSttHint(message)
        stopRecognition()
      },
      onEnd: () => {
        recognitionRef.current = null
        setIsListening(false)
        setInputText(committedRef.current.trim())
      },
    })

    if (!session) {
      setSttHint("음성 인식을 시작할 수 없습니다.")
      return
    }

    recognitionRef.current = session
    setIsListening(true)
  }

  const handleSend = async () => {
    const textToSend = inputText.trim()
    if (!textToSend) return

    if (isListening) stopRecognition()

    setIsSending(true)
    try {
      await onSendMessage(textToSend)
      setInputText("")
      committedRef.current = ""
      setSttHint(null)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "메시지 전송 중 오류가 발생했습니다."
      setSttHint(message)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  return (
    <div className="space-y-3">
      {!sttSupported && (
        <p className="text-center text-xs text-amber-700">
          음성 인식 미지원 브라우저입니다. 텍스트로 입력해 주세요.
        </p>
      )}

      {isListening && (
        <div className="flex items-center justify-center gap-2 text-sm text-primary">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
          </span>
          <span>말씀해 주세요… (인식 중)</span>
        </div>
      )}

      {sttHint && (
        <p className="text-center text-xs text-muted-foreground">{sttHint}</p>
      )}

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value)
            committedRef.current = e.target.value
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            sttSupported
              ? "메시지 입력 또는 마이크로 말하기"
              : "메시지를 입력하세요"
          }
          className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          disabled={disabled || isSending}
        />

        <Button
          variant="outline"
          size="icon"
          onClick={toggleListening}
          disabled={disabled || isSending || !sttSupported}
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
          onClick={() => void handleSend()}
          disabled={disabled || isSending || !inputText.trim()}
          className="h-12 w-12 rounded-xl"
          aria-label="메시지 보내기"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
