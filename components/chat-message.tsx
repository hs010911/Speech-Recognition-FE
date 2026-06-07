"use client"

import { cn } from "@/lib/utils"
import { Volume2 } from "lucide-react"
import { speakText } from "@/lib/speech"
import { FriendAvatar } from "./friend-avatar"
import { GrandfatherAvatar } from "./grandfather-avatar"
import { UserAvatar } from "./user-avatar"
import type { TargetRole } from "@/lib/target-roles"
import { getRoleLabel } from "@/lib/target-roles"

interface ChatMessageProps {
  message: string
  isUser: boolean
  targetRole?: TargetRole
  botRole?: TargetRole
  offerNextRole?: TargetRole
  onOfferAccept?: (nextRole: TargetRole) => void
  onOfferDecline?: () => void
  subtitleRu?: string
  feedback?: {
    type: "correction" | "success"
    message: string
    messageRu?: string
    suggestion?: string
  }
  isFreeTalk?: boolean
}

export function ChatMessage({
  message,
  isUser,
  targetRole = "grandfather",
  botRole,
  offerNextRole,
  onOfferAccept,
  onOfferDecline,
  subtitleRu,
  feedback,
  isFreeTalk = false,
}: ChatMessageProps) {
  const effectiveBotRole = botRole ?? targetRole
  return (
    <div
      className={cn(
        "flex items-start gap-2",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {isUser ? (
        <UserAvatar size="xs" className="mt-0.5" />
      ) : effectiveBotRole === "friend" ? (
        <FriendAvatar size="xs" className="mt-0.5" />
      ) : (
        <GrandfatherAvatar size="xs" className="mt-0.5" />
      )}

      <div
        className={cn(
          "flex min-w-0 max-w-[calc(100%-2.75rem)] flex-col gap-2",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-3 shadow-sm",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-card text-card-foreground border border-border"
          )}
        >
          <div className="min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 flex-1 text-base leading-relaxed whitespace-pre-wrap">{message}</p>
              {!isUser && (
                <button
                  type="button"
                  onClick={() => speakText(message, "ko-KR")}
                  className="shrink-0 rounded-full p-1.5 transition-colors hover:bg-muted/50"
                  aria-label="한국어로 듣기"
                >
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
            {subtitleRu && !isUser && (
              <div className="flex items-start justify-between gap-2">
                <p className="min-w-0 flex-1 text-xs leading-snug text-muted-foreground" lang="ru">
                  {subtitleRu}
                </p>
                <button
                  type="button"
                  onClick={() => speakText(subtitleRu, "ru-RU")}
                  className="shrink-0 rounded-full p-1.5 transition-colors hover:bg-muted/50"
                  aria-label="러시아어 안내 듣기"
                >
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            )}
          </div>
        </div>

        {offerNextRole && !isUser && !isFreeTalk && (
          <div className={cn("flex w-full flex-col gap-2", isUser ? "items-end" : "items-start")}>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onOfferAccept?.(offerNextRole)}
                className="rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                네, {getRoleLabel(offerNextRole)}로 이어서 할래요
              </button>
              <button
                type="button"
                onClick={() => onOfferDecline?.()}
                className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground shadow-sm hover:bg-muted/50"
              >
                아니요
              </button>
            </div>
          </div>
        )}

        {feedback && (
          <div
            className={cn(
              "rounded-xl px-4 py-3 text-sm",
              feedback.type === "correction"
                ? "border border-amber-200 bg-amber-50 text-amber-800"
                : "border border-emerald-200 bg-emerald-50 text-emerald-800"
            )}
          >
            <p className="leading-relaxed">{feedback.message}</p>
            {feedback.messageRu && (
              <div className="mt-2 flex items-start justify-between gap-2">
                <p className="text-xs leading-relaxed text-slate-600" lang="ru">
                  {feedback.messageRu}
                </p>
                <button
                  type="button"
                  onClick={() => speakText(feedback.messageRu ?? "", "ru-RU")}
                  className="shrink-0 rounded-full p-1.5 transition-colors hover:bg-white/50"
                  aria-label="피드백 러시아어로 듣기"
                >
                  <Volume2 className="h-4 w-4 text-slate-500" />
                </button>
              </div>
            )}
            {feedback.suggestion && (
              <p className="mt-2 font-semibold text-primary">{feedback.suggestion}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
