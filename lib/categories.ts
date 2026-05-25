export type CategoryId = "birthday" | "age" | "food" | "name"

export const CATEGORY_META: Record<
  CategoryId,
  { korean: string; russian: string; label: string }
> = {
  birthday: {
    korean: "생일",
    russian: "день рождения",
    label: "생일",
  },
  age: { korean: "나이", russian: "возраст", label: "나이" },
  food: { korean: "밥", russian: "рис", label: "밥" },
  name: { korean: "이름", russian: "имя", label: "이름" },
}

/** API id `home` → `birthday` */
export function normalizeCategoryId(id: string): string {
  if (id === "home") return "birthday"
  return id
}

export function getCategoryLabel(id: string): string {
  const key = normalizeCategoryId(id) as CategoryId
  return CATEGORY_META[key]?.label ?? id
}

export function getTopicHeader(id: string): string {
  const key = normalizeCategoryId(id) as CategoryId
  const meta = CATEGORY_META[key]
  if (!meta) return id
  return `${meta.korean} (${meta.russian})`
}

export function mapCategoryFromApi(cat: { id: string; name: string }): {
  id: string
  name: string
} {
  const id = normalizeCategoryId(cat.id)
  const meta = CATEGORY_META[id as CategoryId]
  return { id, name: cat.name || meta?.label || id }
}

export const FALLBACK_CATEGORIES: { id: string; name: string }[] = [
  { id: "birthday", name: CATEGORY_META.birthday.label },
  { id: "age", name: CATEGORY_META.age.label },
  { id: "food", name: CATEGORY_META.food.label },
  { id: "name", name: CATEGORY_META.name.label },
]
