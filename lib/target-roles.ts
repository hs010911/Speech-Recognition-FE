export type TargetRole = "grandfather" | "friend"

/** 백엔드 SCENARIOS에 friend가 정의된 주제 */
export const FRIEND_SCENARIO_CATEGORIES = new Set(["age", "name"])

export function supportsFriendRole(category: string): boolean {
  return FRIEND_SCENARIO_CATEGORIES.has(category)
}

export function getRoleLabel(role: TargetRole): string {
  return role === "grandfather" ? "할아버지" : "친구"
}

export function getRoleLabelRu(role: TargetRole): string {
  return role === "grandfather" ? "дедушка" : "друг"
}

export function getRolePracticeTitle(role: TargetRole): string {
  return role === "grandfather" ? "할아버지와 대화 연습" : "친구와 대화 연습"
}

export function getRolePracticeTitleRu(role: TargetRole): string {
  return role === "grandfather" ? "Практика с дедушкой" : "Практика с другом"
}
