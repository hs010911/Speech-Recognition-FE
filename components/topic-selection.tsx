"use client"

import { useEffect, useMemo, useState } from "react"
import { Cake, Clock, Utensils, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { homeCopy } from "@/lib/ui-strings"
import { getCategories } from "@/lib/api"
import {
  FALLBACK_CATEGORIES,
  mapCategoryFromApi,
  normalizeCategoryId,
} from "@/lib/categories"
import {
  getRoleLabel,
  getRoleLabelRu,
  supportsFriendRole,
  type TargetRole,
} from "@/lib/target-roles"

interface TopicSelectionProps {
  targetRole: TargetRole
  onTargetRoleChange: (role: TargetRole) => void
  onSelectTopic: (topic: string, targetRole: TargetRole) => void
}

export function TopicSelection({
  targetRole,
  onTargetRoleChange,
  onSelectTopic,
}: TopicSelectionProps) {
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

  const handleTopicClick = (categoryId: string) => {
    const id = normalizeCategoryId(categoryId)
    if (targetRole === "friend" && !supportsFriendRole(id)) return
    onSelectTopic(id, targetRole)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="text-center">
          <h2 className="text-sm font-medium text-foreground">{homeCopy.roleHintKo}</h2>
          <p className="mt-1 text-xs text-muted-foreground" lang="ru">
            {homeCopy.roleHintRu}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(["grandfather", "friend"] as const).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => onTargetRoleChange(role)}
              className={cn(
                "rounded-xl border px-3 py-3 text-sm font-medium transition-colors",
                targetRole === role
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:bg-muted/50"
              )}
            >
              {getRoleLabel(role)}
              <span className="mt-0.5 block text-xs opacity-80" lang="ru">
                {getRoleLabelRu(role)}
              </span>
            </button>
          ))}
        </div>
        {targetRole === "friend" && (
          <p className="text-center text-xs text-muted-foreground">
            {homeCopy.friendTopicNoteKo}
            <span className="mt-0.5 block" lang="ru">
              {homeCopy.friendTopicNoteRu}
            </span>
          </p>
        )}
      </div>

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
          const id = normalizeCategoryId(cat.id)
          const disabled = targetRole === "friend" && !supportsFriendRole(id)
          const meta = metaById[id as keyof typeof metaById]
          const Icon = meta?.icon ?? Utensils
          const color = meta?.color ?? "bg-slate-600 hover:bg-slate-700"
          return (
            <button
              key={cat.id}
              type="button"
              disabled={disabled}
              onClick={() => handleTopicClick(cat.id)}
              className={cn(
                color,
                "flex flex-col items-center justify-center gap-3 rounded-2xl p-6 text-white shadow-lg transition-all",
                disabled
                  ? "cursor-not-allowed opacity-40"
                  : "hover:scale-105 hover:shadow-xl active:scale-95"
              )}
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
