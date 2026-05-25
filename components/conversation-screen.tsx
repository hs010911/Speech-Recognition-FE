"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatMessage } from "./chat-message"
import { VoiceInput } from "./voice-input"
import { GrandfatherAvatar } from "./grandfather-avatar"
import {
  endSession,
  isAppropriateJudgement,
  postTextTurn,
  type StartSessionData,
} from "@/lib/api"
import { getTopicHeader } from "@/lib/categories"
import {
  COMPLETE_MESSAGE_KO,
  RETRY_HINT_KO,
  messagesAfterNextStep,
  messagesFromSessionStart,
  type ChatMessageModel,
} from "@/lib/session-messages"

interface ConversationScreenProps {
  topic: string
  sessionId: string
  sessionStart: StartSessionData
  onBack: () => void
}

export function ConversationScreen({
  topic,
  sessionId,
  sessionStart,
  onBack,
}: ConversationScreenProps) {
  const [messages, setMessages] = useState<ChatMessageModel[]>(() =>
    messagesFromSessionStart(sessionStart)
  )
  const [statusNote, setStatusNote] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleBack = async () => {
    try {
      await endSession(sessionId)
    } catch {
      /* ignore: still leave conversation */
    }
    onBack()
  }

  const handleSendMessage = async (text: string) => {
    if (isComplete || isSubmitting) return

    const trimmed = text.trim()
    if (!trimmed) {
      setStatusNote("인식된 문장이 없습니다. 다시 말하거나 직접 입력해 주세요.")
      return
    }

    setIsSubmitting(true)
    setStatusNote(null)

    try {
      const resp = await postTextTurn({ sessionId, text: trimmed })
      if (!resp.success || !resp.data) {
        throw new Error("서버 응답이 올바르지 않습니다.")
      }

      const { transcript, evaluation, feedback, scenario } = resp.data
      const displayText = transcript.trim() || trimmed
      const isSuccess = isAppropriateJudgement(evaluation.judgement)
      const feedbackMessage = feedback.message?.trim()
      const recommended = feedback.recommendedAnswer?.trim()
      const alternatives = feedback.alternatives?.filter((a) => a?.trim()) ?? []

      const suggestion =
        recommended ??
        (alternatives.length > 0 ? alternatives[0] : undefined)

      const newMessage: ChatMessageModel = {
        id: `user-${Date.now()}`,
        text: displayText,
        isUser: true,
        feedback: feedbackMessage
          ? {
              type: isSuccess ? "success" : "correction",
              message: feedbackMessage,
              suggestion: suggestion ? `"${suggestion}"` : undefined,
            }
          : undefined,
      }

      setMessages((prev) => [...prev, newMessage])

      if (scenario.nextAction === "END") {
        setIsComplete(true)
        setMessages((prev) => [
          ...prev,
          {
            id: `complete-${Date.now()}`,
            text: COMPLETE_MESSAGE_KO,
            isUser: false,
          },
        ])
        return
      }

      if (scenario.nextAction === "NEXT") {
        const nextBotMessages = messagesAfterNextStep(
          scenario.nextStep,
          scenario.nextQuestion
        )
        if (nextBotMessages.length > 0) {
          setMessages((prev) => [...prev, ...nextBotMessages])
        }
        return
      }

      if (scenario.nextAction === "RETRY") {
        const retryLines = [RETRY_HINT_KO]
        const prompt = scenario.prompt?.trim()
        if (prompt) retryLines.push(prompt)
        if (suggestion && !isSuccess) {
          retryLines.push(`예: ${suggestion}`)
        }
        setMessages((prev) => [
          ...prev,
          {
            id: `retry-${Date.now()}`,
            text: retryLines.join("\n"),
            isUser: false,
          },
        ])
      }
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "평가 요청 중 오류가 발생했습니다."
      setStatusNote(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => void handleBack()}
          className="h-10 w-10 shrink-0 rounded-full"
          aria-label="뒤로 가기"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <GrandfatherAvatar size="sm" className="shrink-0" />
          <div className="min-w-0">
            <p className="font-semibold text-card-foreground">할아버지</p>
            <p className="truncate text-sm text-muted-foreground">
              대화 상황: {getTopicHeader(topic)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message.text}
            subtitleRu={message.subtitleRu}
            isUser={message.isUser}
            feedback={message.feedback}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-border bg-card p-4">
        {statusNote && (
          <p className="mb-2 text-center text-xs text-muted-foreground">{statusNote}</p>
        )}
        {isSubmitting && (
          <p className="mb-2 text-center text-xs text-primary">백엔드에서 평가 중…</p>
        )}
        {isComplete && (
          <p className="mb-2 text-center text-xs text-emerald-700">
            연습이 완료되었습니다. 뒤로 가기로 주제를 다시 선택할 수 있어요.
          </p>
        )}
        <VoiceInput
          onSendMessage={handleSendMessage}
          disabled={isComplete || isSubmitting}
        />
      </div>
    </div>
  )
}
