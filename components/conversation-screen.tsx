"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatMessage } from "./chat-message"
import { VoiceInput } from "./voice-input"
import { FriendAvatar } from "./friend-avatar"
import { GrandfatherAvatar } from "./grandfather-avatar"
import {
  endSession,
  isAppropriateJudgement,
  postTextTurn,
  startSession,
  type StartSessionData,
} from "@/lib/api"
import { getTopicHeader } from "@/lib/categories"
import { getRoleLabel, supportsFriendRole } from "@/lib/target-roles"
import { translateKoToRu } from "@/lib/translate"
import type { TargetRole } from "@/lib/target-roles"
import {
  COMPLETE_MESSAGE_KO,
  RETRY_HINT_FRIEND_KO,
  RETRY_HINT_GRANDFATHER_KO,
  messagesAfterNextStep,
  messagesFromSessionStart,
  type ChatMessageModel,
} from "@/lib/session-messages"

interface ConversationScreenProps {
  topic: string
  targetRole: TargetRole
  sessionId: string
  sessionStart: StartSessionData
  onBack: () => void
}

export function ConversationScreen({
  topic,
  targetRole,
  sessionId,
  sessionStart,
  onBack,
}: ConversationScreenProps) {
  const [currentTargetRole, setCurrentTargetRole] = useState<TargetRole>(targetRole)
  const [currentSessionId, setCurrentSessionId] = useState<string>(sessionId)
  const [completedRoles, setCompletedRoles] = useState<Record<TargetRole, boolean>>({
    grandfather: false,
    friend: false,
  })
  const [messages, setMessages] = useState<ChatMessageModel[]>(() =>
    messagesFromSessionStart(sessionStart).map((m) =>
      m.isUser ? m : { ...m, botRole: targetRole }
    )
  )
  const [statusNote, setStatusNote] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    const pending = messages.filter((m) => !m.isUser && !m.ruChecked)
    if (pending.length === 0) return

    let cancelled = false
    void (async () => {
      const translated = await Promise.all(
        pending.map(async (m) => ({
          id: m.id,
          ru: await translateKoToRu(m.text),
        }))
      )
      if (cancelled) return

      const ruById = new Map(translated.map((item) => [item.id, item.ru]))
      setMessages((prev) =>
        prev.map((m) => {
          if (m.isUser || m.ruChecked) return m
          const ru = ruById.get(m.id)
          return {
            ...m,
            subtitleRu: ru ?? m.subtitleRu,
            ruChecked: true,
          }
        })
      )
    })()

    return () => {
      cancelled = true
    }
  }, [messages])

  const handleBack = async () => {
    try {
      await endSession(currentSessionId)
    } catch {}
    onBack()
  }

  const showFollowUpOfferIfNeeded = (justCompletedRole: TargetRole) => {
    if (!supportsFriendRole(topic)) return

    const nextRole: TargetRole =
      justCompletedRole === "grandfather" ? "friend" : "grandfather"
    if (completedRoles[nextRole]) return

    setMessages((prev) => [
      ...prev,
      {
        id: `offer-${Date.now()}`,
        isUser: false,
        text: `${getRoleLabel(justCompletedRole)} 연습을 끝냈어요. 이어서 ${getRoleLabel(nextRole)}로 같은 주제를 연습할까요?`,
        botRole: justCompletedRole,
        offerNextRole: nextRole,
      },
    ])
  }

  const startFollowUp = async (nextRole: TargetRole) => {
    if (isSubmitting) return
    setIsSubmitting(true)
    setStatusNote(null)

    try {
      const resp = await startSession({
        category: topic,
        targetRole: nextRole,
        language: "ko",
      })
      if (!resp.success || !resp.data || !resp.data.sessionId) {
        throw new Error("세션을 시작할 수 없습니다.")
      }
      const data = resp.data

      setCurrentTargetRole(nextRole)
      setCurrentSessionId(data.sessionId)
      setIsComplete(false)

      setMessages((prev) => [
        ...prev,
        {
          id: `switch-${Date.now()}`,
          isUser: false,
          text: `${getRoleLabel(nextRole)} 연습을 시작할게요.`,
          botRole: nextRole,
        },
        ...messagesFromSessionStart(data).map((m) =>
          m.isUser ? m : { ...m, botRole: nextRole }
        ),
      ])
    } catch (e) {
      const msg = e instanceof Error ? e.message : "세션 시작 중 오류가 발생했습니다."
      setStatusNote(msg)
    } finally {
      setIsSubmitting(false)
    }
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
      const resp = await postTextTurn({ sessionId: currentSessionId, text: trimmed })
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
      const feedbackRu = feedbackMessage ? await translateKoToRu(feedbackMessage) : null

      const newMessage: ChatMessageModel = {
        id: `user-${Date.now()}`,
        text: displayText,
        isUser: true,
        feedback: feedbackMessage
          ? {
              type: isSuccess ? "success" : "correction",
              message: feedbackMessage,
              messageRu: feedbackRu ?? undefined,
              suggestion: suggestion ? `"${suggestion}"` : undefined,
            }
          : undefined,
      }

      setMessages((prev) => [...prev, newMessage])

      if (scenario.nextAction === "END") {
        setCompletedRoles((prev) => ({ ...prev, [currentTargetRole]: true }))
        setIsComplete(true)
        setMessages((prev) => [
          ...prev,
          {
            id: `complete-${Date.now()}`,
            text: COMPLETE_MESSAGE_KO,
            isUser: false,
            botRole: currentTargetRole,
          },
        ])
        showFollowUpOfferIfNeeded(currentTargetRole)
        return
      }

      if (scenario.nextAction === "NEXT") {
        const nextBotMessages = messagesAfterNextStep(
          scenario.nextStep,
          scenario.nextQuestion
        )
        if (nextBotMessages.length > 0) {
          setMessages((prev) => [
            ...prev,
            ...nextBotMessages.map((m) => (m.isUser ? m : { ...m, botRole: currentTargetRole })),
          ])
        }
        return
      }

      if (scenario.nextAction === "RETRY") {
        const retryHint =
          currentTargetRole === "friend"
            ? RETRY_HINT_FRIEND_KO
            : RETRY_HINT_GRANDFATHER_KO
        const retryLines = [retryHint]
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
            botRole: currentTargetRole,
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
          {currentTargetRole === "friend" ? (
            <FriendAvatar size="sm" className="shrink-0" />
          ) : (
            <GrandfatherAvatar size="sm" className="shrink-0" />
          )}
          <div className="min-w-0">
            <p className="font-semibold text-card-foreground">
              {getRoleLabel(currentTargetRole)}
            </p>
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
            targetRole={currentTargetRole}
            botRole={message.botRole}
            offerNextRole={message.offerNextRole}
            onOfferAccept={(nextRole) => void startFollowUp(nextRole)}
            onOfferDecline={() => {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === message.id ? { ...m, offerNextRole: undefined } : m
                )
              )
            }}
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
