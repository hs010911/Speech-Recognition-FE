"use client"

import { cn } from "@/lib/utils"
import { Globe, Volume2 } from "lucide-react"
import { speakText } from "@/lib/speech"

interface ChatMessageProps {
  message: string
  isUser: boolean
  subtitleRu?: string
  feedback?: {
    type: "correction" | "success"
    message: string
    suggestion?: string
  }
}

export function ChatMessage({ message, isUser, subtitleRu, feedback }: ChatMessageProps) {
  return (
    <div className={cn("flex flex-col gap-2", isUser ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-card text-card-foreground border border-border"
        )}
      >
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-base leading-relaxed">{message}</p>
            {subtitleRu && !isUser && (
              <p className="text-xs leading-snug text-muted-foreground" lang="ru">
                {subtitleRu}
              </p>
            )}
          </div>
          {!isUser && (
            <div className="flex shrink-0 flex-col gap-1">
              <button
                type="button"
                onClick={() => speakText(message, "ko-KR")}
                className="rounded-full p-1.5 hover:bg-muted/50 transition-colors"
                aria-label="한국어로 듣기"
              >
                <Volume2 className="h-4 w-4 text-muted-foreground" />
              </button>
              {subtitleRu && (
                <button
                  type="button"
                  onClick={() => speakText(subtitleRu, "ru-RU")}
                  className="rounded-full p-1.5 hover:bg-muted/50 transition-colors"
                  aria-label="러시아어 안내 듣기"
                >
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {feedback && (
        <div
          className={cn(
            "max-w-[85%] rounded-xl px-4 py-3 text-sm",
            feedback.type === "correction"
              ? "bg-amber-50 border border-amber-200 text-amber-800"
              : "bg-emerald-50 border border-emerald-200 text-emerald-800"
          )}
        >
          <p className="leading-relaxed">{feedback.message}</p>
          {feedback.suggestion && (
            <p className="mt-2 font-semibold text-primary">
              {feedback.suggestion}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
