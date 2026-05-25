"use client"

import { useEffect, useMemo, useState } from "react"
import { Cake, Clock, Utensils, User } from "lucide-react"
import { homeCopy } from "@/lib/ui-strings"
import { getCategories } from "@/lib/api"
import {
  FALLBACK_CATEGORIES,
  mapCategoryFromApi,
  normalizeCategoryId,
} from "@/lib/categories"

interface TopicSelectionProps {
  onSelectTopic: (topic: string) => void
}

export function TopicSelection({ onSelectTopic }: TopicSelectionProps) {
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const metaById = useMemo(() => {
    return {
      birthday: { icon: Cake, color: "bg-blue-500 hover:bg-blue-600" },
      home: { icon: Cake, color: "bg-blue-500 hover:bg-blue-600" },
      age: { icon: Clock, color: "bg-amber-500 hover:bg-amber-600" },
      food: { icon: Utensils, color: "bg-emerald-500 hover:bg-emerald-600" },
      name: { icon: User, color: "bg-rose-500 hover:bg-rose-600" },
    } as const
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const resp = await getCategories()
        if (!resp.success || !resp.data) throw new Error("카테고리 응답이 올바르지 않습니다.")
        if (!cancelled) {
          setCategories(resp.data.map(mapCategoryFromApi))
          setErrorMessage(null)
        }
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : "카테고리를 불러오는 중 오류가 발생했습니다."
        if (!cancelled) {
          setErrorMessage(`${msg} (로컬 주제 목록을 사용 중)`)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-medium text-foreground">{homeCopy.topicHintKo}</h2>
        <p className="mt-1 text-sm text-muted-foreground" lang="ru">
          {homeCopy.topicHintRu}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {errorMessage && (
          <p className="col-span-2 text-center text-xs text-muted-foreground">
            {errorMessage}
          </p>
        )}
        {categories.map((cat) => {
            const meta = metaById[cat.id as keyof typeof metaById]
            const Icon = meta?.icon ?? Utensils
            const color = meta?.color ?? "bg-slate-600 hover:bg-slate-700"
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectTopic(normalizeCategoryId(cat.id))}
                className={`${color} flex flex-col items-center justify-center gap-3 rounded-2xl p-6 text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95`}
              >
                <Icon className="h-10 w-10" />
                <div className="text-center">
                  <p className="text-xl font-bold">{cat.name}</p>
                </div>
              </button>
            )
          })}
      </div>
    </div>
  )
}
