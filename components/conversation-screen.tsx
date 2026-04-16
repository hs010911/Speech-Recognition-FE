"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatMessage } from "./chat-message"
import { VoiceInput, type VoiceSendMeta } from "./voice-input"
import { GrandfatherAvatar } from "./grandfather-avatar"

interface Message {
  id: string
  text: string
  subtitleRu?: string
  isUser: boolean
  feedback?: {
    type: "correction" | "success"
    message: string
    suggestion?: string
  }
}

interface ConversationScreenProps {
  topic: string
  onBack: () => void
}

type Scenario = {
  prompt: string
  promptRu?: string
  instruction: string
  instructionRu?: string
  expectedPolite: string[]
  corrections: { pattern: string; feedback: string; suggestion: string }[]
}

// TODO(BE 연동): 현재는 시나리오를 프론트에 하드코딩합니다.
// 추후 /api/scenarios?topic={topic} 형태로 받아오고, 이 타입과 매핑해서 렌더링하세요.
const topicData: Record<
  string,
  {
    korean: string
    russian: string
    scenarios: Scenario[]
  }
> = {
  food: {
    korean: "밥",
    russian: "рис",
    scenarios: [
      {
        prompt: "오늘 밥 먹었어요?",
        promptRu: "Вы сегодня уже поели?",
        instruction: "",
        instructionRu: "",
        expectedPolite: ["네, 밥 먹었어요", "네, 먹었어요", "먹었어요", "네, 식사했어요"],
        corrections: [
          {
            pattern: "먹었어",
            feedback: "문장 끝을 더 공손하게 표현해보세요.",
            suggestion: '"네, 밥 먹었어요" 라는 말이 더 적절해요',
          },
          {
            pattern: "어 밥",
            feedback: "문장 끝을 더 공손하게 표현해보세요.",
            suggestion: '"네, 밥 먹었어요" 라는 말이 더 적절해요',
          },
        ],
      },
      {
        prompt: "밥으로 뭐 먹었어요?",
        promptRu: "Что вы ели (на этот приём пищи)?",
        instruction: "",
        instructionRu: "",
        expectedPolite: ["먹었어요", "했어요", "요"],
        corrections: [
          {
            pattern: "먹었어",
            feedback: "상대방이 존댓말로 질문했기 때문에, 같은 존댓말로 대답하는 것이 좋아요.",
            suggestion: '"○○을/를 먹었어요"라고 하면 자연스러워요.',
          },
        ],
      },
      {
        prompt: "",
        promptRu: "",
        instruction: "상대방이 밥을 먹었는지 물어보세요!",
        instructionRu: "Спросите, поел ли собеседник!",
        expectedPolite: ["식사 하셨어요", "진지 잡수셨어요", "드셨어요", "하셨어요"],
        corrections: [
          {
            pattern: "밥 먹었어",
            feedback: "지금 표현은 친구에게 사용하는 말이에요. 할아버지께는 존댓말로 말하는 것이 좋아요.",
            suggestion: '"식사 하셨어요?" 또는 "진지 잡수셨어요?"라고 말해보세요.',
          },
        ],
      },
      {
        prompt: "",
        promptRu: "",
        instruction: "무엇을 드셨는지 물어보세요!",
        instructionRu: "Спросите, что именно он ел!",
        expectedPolite: ["드셨어요", "잡수셨어요", "하셨어요"],
        corrections: [
          {
            pattern: "뭐 먹었어",
            feedback: "어르신께는 반말 대신 존댓말을 사용해야 해요.",
            suggestion: '"할아버지, 무엇을 드셨어요?"라고 말해보세요.',
          },
        ],
      },
    ],
  },
  home: {
    korean: "집",
    russian: "дом",
    scenarios: [
      {
        prompt: "어디 사세요?",
        promptRu: "Где вы живёте?",
        instruction: "",
        instructionRu: "",
        expectedPolite: ["살아요", "있어요", "요"],
        corrections: [
          {
            pattern: "살아",
            feedback: "문장 끝을 더 공손하게 표현해보세요.",
            suggestion: '"○○에 살아요"라고 하면 자연스러워요.',
          },
        ],
      },
      {
        prompt: "",
        promptRu: "",
        instruction: "할아버지께 어디 사시는지 여쭤보세요!",
        instructionRu: "Спросите у дедушки, где он живёт!",
        expectedPolite: ["사세요", "계세요"],
        corrections: [
          {
            pattern: "살아",
            feedback: "어르신께는 높임말을 사용해야 해요.",
            suggestion: '"어디 사세요?"라고 말해보세요.',
          },
        ],
      },
    ],
  },
  age: {
    korean: "나이",
    russian: "возраст",
    scenarios: [
      {
        prompt: "몇 살이에요?",
        promptRu: "Сколько вам лет?",
        instruction: "",
        instructionRu: "",
        expectedPolite: ["살이에요", "이에요", "요"],
        corrections: [
          {
            pattern: "살이야",
            feedback: "문장 끝을 더 공손하게 표현해보세요.",
            suggestion: '"○○살이에요"라고 하면 자연스러워요.',
          },
        ],
      },
      {
        prompt: "",
        promptRu: "",
        instruction: "할아버지께 연세를 여쭤보세요!",
        instructionRu: "Спросите у дедушки возраст (учтиво)!",
        expectedPolite: ["연세", "어떻게 되세요"],
        corrections: [
          {
            pattern: "몇 살",
            feedback: "어르신께는 '나이' 대신 '연세'라는 높임말을 사용해요.",
            suggestion: '"연세가 어떻게 되세요?"라고 말해보세요.',
          },
        ],
      },
    ],
  },
  name: {
    korean: "이름",
    russian: "имя",
    scenarios: [
      {
        prompt: "이름이 뭐예요?",
        promptRu: "Как вас зовут?",
        instruction: "",
        instructionRu: "",
        expectedPolite: ["이에요", "예요", "입니다", "요"],
        corrections: [
          {
            pattern: "이야",
            feedback: "문장 끝을 더 공손하게 표현해보세요.",
            suggestion: '"○○이에요" 또는 "○○입니다"라고 하면 자연스러워요.',
          },
        ],
      },
      {
        prompt: "",
        promptRu: "",
        instruction: "할아버지께 성함을 여쭤보세요!",
        instructionRu: "Спросите у дедушки имя (очень вежливо)!",
        expectedPolite: ["성함", "어떻게 되세요"],
        corrections: [
          {
            pattern: "이름이 뭐",
            feedback: "어르신께는 '이름' 대신 '성함'이라는 높임말을 사용해요.",
            suggestion: '"성함이 어떻게 되세요?"라고 말해보세요.',
          },
        ],
      },
    ],
  },
}

const COMPLETE_KO = "축하합니다! 이 주제의 모든 연습을 완료했어요! 🎉"
const COMPLETE_RU = "Поздравляем! Вы завершили все упражнения по этой теме!"

export function ConversationScreen({ topic, onBack }: ConversationScreenProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0)
  const [audioNote, setAudioNote] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const data = topicData[topic]
  const currentScenario = data?.scenarios[currentScenarioIndex]

  useEffect(() => {
    if (currentScenario) {
      const initialMessages: Message[] = []

      if (currentScenario.prompt) {
        initialMessages.push({
          id: `prompt-${currentScenarioIndex}`,
          text: currentScenario.prompt,
          subtitleRu: currentScenario.promptRu,
          isUser: false,
        })
      }

      if (currentScenario.instruction) {
        initialMessages.push({
          id: `instruction-${currentScenarioIndex}`,
          text: currentScenario.instruction,
          subtitleRu: currentScenario.instructionRu,
          isUser: false,
        })
      }

      setMessages(initialMessages)
    }
  }, [currentScenarioIndex, currentScenario])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // TODO(AI 연동): 임시 규칙 기반 판정 로직.
  // 추후에는 서버 API(예: POST /api/evaluate)로 userInput, topic, scenarioId를 보내고
  // { type, message, suggestion } 형태로 받아 이 함수 자리를 대체하면 됩니다.
  const analyzeResponse = (userInput: string) => {
    if (!currentScenario) return null

    const isPolite = currentScenario.expectedPolite.some((phrase) =>
      userInput.includes(phrase)
    )

    if (isPolite) {
      return {
        type: "success" as const,
        message: "잘했어요! 올바른 존댓말을 사용했습니다.",
      }
    }

    for (const correction of currentScenario.corrections) {
      if (userInput.includes(correction.pattern)) {
        return {
          type: "correction" as const,
          message: correction.feedback,
          suggestion: correction.suggestion,
        }
      }
    }

    return {
      type: "correction" as const,
      message: "존댓말로 다시 말해보세요.",
      suggestion: currentScenario.expectedPolite[0]
        ? `"${currentScenario.expectedPolite[0]}"를 사용해보세요.`
        : undefined,
    }
  }

  const handleSendMessage = (text: string, meta?: VoiceSendMeta) => {
    // TODO(BE 연동): 여기에서 API 호출 흐름을 붙입니다.
    // 1) meta.audioBlob 업로드(선택) -> STT 결과 텍스트 확보
    // 2) 텍스트/시나리오 정보로 AI 평가 API 호출
    // 3) API 응답(feedback)으로 setMessages 업데이트
    const feedback = analyzeResponse(text)

    const newMessage: Message = {
      id: `user-${Date.now()}`,
      text,
      isUser: true,
      feedback: feedback || undefined,
    }

    setMessages((prev) => [...prev, newMessage])

    // TODO(BE 연동): 현재는 안내 문구만 표시합니다.
    // 실제 연동 시 meta.audioBlob을 FormData로 전송하고 서버 응답 상태를 표시하세요.
    if (meta?.audioBlob && typeof meta.audioDurationMs === "number") {
      setAudioNote(
        `마지막 답변에 음성 파일이 포함되었습니다 (${(meta.audioDurationMs / 1000).toFixed(1)}초). 백엔드 연동 시 업로드할 수 있습니다.`
      )
    } else {
      setAudioNote(null)
    }

    if (feedback?.type === "success") {
      setTimeout(() => {
        if (currentScenarioIndex < (data?.scenarios.length || 0) - 1) {
          setCurrentScenarioIndex((prev) => prev + 1)
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: `complete-${Date.now()}`,
              text: COMPLETE_KO,
              subtitleRu: COMPLETE_RU,
              isUser: false,
            },
          ])
        }
      }, 1500)
    }
  }

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">주제를 찾을 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-10 w-10 shrink-0 rounded-full"
          aria-label="뒤로 가기"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <GrandfatherAvatar size="sm" className="shrink-0" />
          <div className="min-w-0">
            <p className="font-semibold text-card-foreground">할아버지</p>
            <p className="truncate text-sm text-muted-foreground">
              대화 상황: {data.korean} ({data.russian})
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message.text}
            subtitleRu={message.subtitleRu}
            isUser={message.isUser}
            feedback={message.feedback}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-border bg-card p-4">
        {audioNote && (
          <p className="mb-2 text-center text-xs text-muted-foreground">{audioNote}</p>
        )}
        <VoiceInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  )
}
