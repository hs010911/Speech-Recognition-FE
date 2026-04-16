"use client"

import { Home, Clock, Utensils, User } from "lucide-react"
import { homeCopy } from "@/lib/ui-strings"

interface TopicSelectionProps {
  onSelectTopic: (topic: string) => void
}

const topics = [
  {
    id: "home",
    korean: "집",
    russian: "дом",
    icon: Home,
    color: "bg-blue-500 hover:bg-blue-600",
  },
  {
    id: "age",
    korean: "나이",
    russian: "возраст",
    icon: Clock,
    color: "bg-amber-500 hover:bg-amber-600",
  },
  {
    id: "food",
    korean: "밥",
    russian: "рис",
    icon: Utensils,
    color: "bg-emerald-500 hover:bg-emerald-600",
  },
  {
    id: "name",
    korean: "이름",
    russian: "имя",
    icon: User,
    color: "bg-rose-500 hover:bg-rose-600",
  },
]

export function TopicSelection({ onSelectTopic }: TopicSelectionProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-medium text-foreground">{homeCopy.topicHintKo}</h2>
        <p className="mt-1 text-sm text-muted-foreground" lang="ru">
          {homeCopy.topicHintRu}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {topics.map((topic) => (
          <button
            key={topic.id}
            type="button"
            onClick={() => onSelectTopic(topic.id)}
            className={`${topic.color} flex flex-col items-center justify-center gap-3 rounded-2xl p-6 text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95`}
          >
            <topic.icon className="h-10 w-10" />
            <div className="text-center">
              <p className="text-xl font-bold">{topic.korean}</p>
              <p className="text-sm opacity-80" lang="ru">
                ({topic.russian})
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
