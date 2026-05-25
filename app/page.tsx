"use client"

import { useState } from "react"
import { TopicSelection } from "@/components/topic-selection"
import { ConversationScreen } from "@/components/conversation-screen"
import { GrandfatherAvatar } from "@/components/grandfather-avatar"
import { homeCopy } from "@/lib/ui-strings"
import { getApiBaseUrlForDisplay, startSession, type StartSessionData } from "@/lib/api"

export default function Home() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionStart, setSessionStart] = useState<StartSessionData | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [startError, setStartError] = useState<string | null>(null)

  if (selectedTopic && sessionId && sessionStart) {
    return (
      <main className="mx-auto h-dvh w-full max-w-md">
        <ConversationScreen
          topic={selectedTopic}
          sessionId={sessionId}
          sessionStart={sessionStart}
          onBack={() => {
            setSelectedTopic(null)
            setSessionId(null)
            setSessionStart(null)
            setStartError(null)
          }}
        />
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background">
      <header className="p-6 text-center">
        <h1 className="text-xl font-bold text-foreground">{homeCopy.titleKo}</h1>
        <p className="mt-1 text-sm text-muted-foreground" lang="ru">
          {homeCopy.titleRu}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">{homeCopy.subtitleKo}</p>
        <p className="text-xs text-muted-foreground/90" lang="ru">
          {homeCopy.subtitleRu}
        </p>
        <p className="mt-2 text-[11px] text-muted-foreground/80">
          API: {getApiBaseUrlForDisplay()}
        </p>
      </header>

      <div className="flex flex-col items-center py-6">
        <GrandfatherAvatar size="lg" />
        <p className="mt-4 font-medium text-foreground">{homeCopy.practiceKo}</p>
        <p className="text-sm text-muted-foreground" lang="ru">
          {homeCopy.practiceRu}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{homeCopy.hintKo}</p>
        <p className="text-xs text-muted-foreground/90" lang="ru">
          {homeCopy.hintRu}
        </p>
      </div>

      <div className="flex-1 px-4 pb-4">
        <TopicSelection
          onSelectTopic={async (topic) => {
            setIsStarting(true)
            setStartError(null)
            try {
              const resp = await startSession({
                category: topic,
                targetRole: "grandfather",
                language: "ko",
              })
              const data = resp.data
              if (!resp.success || !data?.sessionId) {
                throw new Error("세션 ID를 받지 못했습니다.")
              }
              setSelectedTopic(topic)
              setSessionId(data.sessionId)
              setSessionStart(data)
            } catch (e) {
              const msg =
                e instanceof Error
                  ? e.message
                  : "세션 시작 중 오류가 발생했습니다."
              setStartError(msg)
            } finally {
              setIsStarting(false)
            }
          }}
        />
        {isStarting && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            서버에 연결 중입니다…
          </p>
        )}
        {startError && (
          <p className="mt-4 text-center text-xs text-destructive">
            {startError}
            <br />
            <span className="text-muted-foreground">
              백엔드를 실행했는지 확인하세요: uvicorn app.main:app --reload
            </span>
          </p>
        )}
      </div>

      <section className="border-t border-border px-4 py-3">
        <ul className="list-inside list-disc space-y-2 text-xs text-muted-foreground">
          {homeCopy.bulletsKo.map((line, i) => (
            <li key={i}>
              <span className="text-foreground/90">{line}</span>
              <span className="mt-0.5 block pl-4 text-muted-foreground/90" lang="ru">
                {homeCopy.bulletsRu[i]}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <footer className="border-t border-border p-4 text-center">
        <p className="text-xs text-muted-foreground">{homeCopy.footerKo}</p>
        <p className="mt-1 text-xs text-muted-foreground/90" lang="ru">
          {homeCopy.footerRu}
        </p>
      </footer>
    </main>
  )
}
