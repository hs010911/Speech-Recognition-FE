"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { TopicSelection } from "@/components/topic-selection"
import { ConversationScreen } from "@/components/conversation-screen"
import { FriendAvatar } from "@/components/friend-avatar"
import { GrandfatherAvatar } from "@/components/grandfather-avatar"
import { homeCopy } from "@/lib/ui-strings"
import {
  checkHealth,
  getApiBaseUrlForDisplay,
  startSession,
  type StartSessionData,
} from "@/lib/api"
import { getRoleLabel, getRolePracticeTitle, getRolePracticeTitleRu } from "@/lib/target-roles"
import type { TargetRole } from "@/lib/target-roles"

export default function Home() {
  const [targetRole, setTargetRole] = useState<TargetRole>("grandfather")
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [selectedTargetRole, setSelectedTargetRole] = useState<TargetRole>("grandfather")
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionStart, setSessionStart] = useState<StartSessionData | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [startError, setStartError] = useState<string | null>(null)
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">(
    "checking"
  )

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const resp = await checkHealth()
        if (!cancelled) {
          setApiStatus(resp.success ? "online" : "offline")
        }
      } catch {
        if (!cancelled) setApiStatus("offline")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (selectedTopic && sessionId && sessionStart) {
    return (
      <main className="mx-auto h-dvh w-full max-w-md">
        <ConversationScreen
          topic={selectedTopic}
          targetRole={selectedTargetRole}
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
          {apiStatus === "checking" && " · 연결 확인 중…"}
          {apiStatus === "online" && " · 백엔드 연결됨"}
          {apiStatus === "offline" && " · 백엔드 미연결 (세션 시작·주제 목록 제한)"}
        </p>
      </header>

      <div className="flex flex-col items-center py-6">
        <div className="flex items-end gap-4">
          {(["grandfather", "friend"] as const).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setTargetRole(role)}
              className={cn(
                "rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                targetRole === role
                  ? "scale-105 ring-4 ring-primary ring-offset-2 ring-offset-background"
                  : "scale-95 opacity-50 hover:opacity-80"
              )}
              aria-label={`${getRoleLabel(role)} 선택`}
              aria-pressed={targetRole === role}
            >
              {role === "grandfather" ? (
                <GrandfatherAvatar size="md" />
              ) : (
                <FriendAvatar size="md" />
              )}
            </button>
          ))}
        </div>
        <p className="mt-4 font-medium text-foreground">{getRolePracticeTitle(targetRole)}</p>
        <p className="text-sm text-muted-foreground" lang="ru">
          {getRolePracticeTitleRu(targetRole)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{homeCopy.hintKo}</p>
        <p className="text-xs text-muted-foreground/90" lang="ru">
          {homeCopy.hintRu}
        </p>
      </div>

      <div className="flex-1 px-4 pb-4">
        <TopicSelection
          targetRole={targetRole}
          onTargetRoleChange={setTargetRole}
          onSelectTopic={async (topic, role) => {
            setIsStarting(true)
            setStartError(null)
            try {
              const resp = await startSession({
                category: topic,
                targetRole: role,
                language: "ko",
              })
              const data = resp.data
              if (!resp.success || !data?.sessionId) {
                throw new Error("세션 ID를 받지 못했습니다.")
              }
              setSelectedTopic(topic)
              setSelectedTargetRole(role)
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
              백엔드를 실행했는지 확인하세요: uvicorn app.main:app --host 127.0.0.1 --port 8000
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
