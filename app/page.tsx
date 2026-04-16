"use client"

import { useState } from "react"
import { TopicSelection } from "@/components/topic-selection"
import { ConversationScreen } from "@/components/conversation-screen"
import { GrandfatherAvatar } from "@/components/grandfather-avatar"
import { homeCopy } from "@/lib/ui-strings"

export default function Home() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)

  if (selectedTopic) {
    return (
      <main className="mx-auto h-dvh w-full max-w-md">
        <ConversationScreen topic={selectedTopic} onBack={() => setSelectedTopic(null)} />
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
        <TopicSelection onSelectTopic={setSelectedTopic} />
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
