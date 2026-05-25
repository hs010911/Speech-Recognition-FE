import type { ScenarioStep, StartSessionData } from "@/lib/api"

export type ChatMessageModel = {
  id: string
  text: string
  isUser: boolean
  subtitleRu?: string
  feedback?: {
    type: "correction" | "success"
    message: string
    suggestion?: string
  }
}

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function messagesFromSessionStart(data: StartSessionData): ChatMessageModel[] {
  return messagesFromStep({
    systemUtterance: data.systemUtterance,
    prompt: data.prompt,
  })
}

export function messagesFromStep(step: {
  systemUtterance?: string | null
  prompt?: string | null
}): ChatMessageModel[] {
  const out: ChatMessageModel[] = []
  const utterance = step.systemUtterance?.trim()
  const prompt = step.prompt?.trim()

  if (utterance) {
    out.push({
      id: uid("utterance"),
      text: utterance,
      isUser: false,
    })
  }

  if (prompt && prompt !== utterance) {
    out.push({
      id: uid("prompt"),
      text: prompt,
      isUser: false,
    })
  }

  return out
}

export function messagesAfterNextStep(
  nextStep: ScenarioStep | null,
  nextQuestion: string | null
): ChatMessageModel[] {
  if (nextStep) {
    return messagesFromStep({
      systemUtterance: nextStep.systemUtterance,
      prompt: nextStep.prompt ?? nextQuestion,
    })
  }
  if (nextQuestion?.trim()) {
    return [
      {
        id: uid("next"),
        text: nextQuestion.trim(),
        isUser: false,
      },
    ]
  }
  return []
}

export const COMPLETE_MESSAGE_KO =
  "축하합니다! 이 주제의 모든 연습을 완료했어요! 🎉"

export const RETRY_HINT_KO =
  "다시 한번 말해 보세요. 존댓말 표현을 확인해 주세요."
