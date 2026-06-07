export type StartSessionRequest = {
  category: string
  targetRole: string
  language?: string
}

export type ScenarioStep = {
  stepId: string
  turnType: string
  prompt: string
  systemUtterance?: string | null
  recommendedAnswers: string[]
}

export type StartSessionData = {
  sessionId: string
  category: string
  targetRole: string
  currentStepIndex: number
  currentStepId: string
  turnType: string
  prompt: string
  systemUtterance?: string | null
  recommendedAnswers: string[]
}

export type TurnEvaluation = {
  judgement: string
  score: number
  levels?: Record<string, string>
  errorTypes: string[]
}

export type TurnFeedback = {
  message: string
  recommendedAnswer?: string | null
  alternatives?: string[]
}

export type TurnScenario = {
  currentStepId: string
  turnType: string
  prompt: string
  recommendedAnswers: string[]
  nextAction: "RETRY" | "NEXT" | "END" | string
  nextQuestion: string | null
  nextStep: ScenarioStep | null
}

export type TurnResponseData = {
  transcript: string
  evaluation: TurnEvaluation
  feedback: TurnFeedback
  scenario: TurnScenario
  classifierResult?: unknown
}

type ApiSuccess<T> = { success: boolean; data?: T }

export type StartSessionResponse = ApiSuccess<StartSessionData>
export type TurnResponse = ApiSuccess<TurnResponseData>
export type CategoriesResponse = ApiSuccess<{ id: string; name: string }[]>
export type HealthResponse = ApiSuccess<{ status: string }>
export type EndSessionResponse = ApiSuccess<{ sessionId: string; ended: boolean }>

export type FreeTalkRequest = {
  text: string
}

export type FreeTalkResponseData = {
  aiText: string
  targetRole: string
}

export type FreeTalkResponse = ApiSuccess<FreeTalkResponseData>
export type StartFreeTalkResponse = ApiSuccess<{ message: string }>

function getApiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"
  return base.replace(/\/$/, "")
}

function apiUrl(path: string): string {
  return `${getApiBaseUrl()}/api${path.startsWith("/") ? path : `/${path}`}`
}

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { detail?: string | { msg: string }[] }
    if (typeof body.detail === "string") return body.detail
    if (Array.isArray(body.detail)) {
      return body.detail.map((d) => d.msg).join(", ")
    }
  } catch {}
  return `요청 실패 (${res.status})`
}

const FETCH_TIMEOUT_MS = 4_000
const TURN_FETCH_TIMEOUT_MS = 20_000

async function fetchJson<T>(
  path: string,
  init?: RequestInit,
  timeoutMs = FETCH_TIMEOUT_MS
): Promise<T> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(apiUrl(path), {
      ...init,
      signal: controller.signal,
    })
    if (!res.ok) {
      throw new Error(await parseErrorMessage(res))
    }
    return (await res.json()) as T
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new Error(
        `서버 응답 시간 초과(${timeoutMs / 1000}초). 백엔드가 ${getApiBaseUrl()} 에서 실행 중인지 확인하세요.`
      )
    }
    throw e
  } finally {
    clearTimeout(timeoutId)
  }
}

export function getApiBaseUrlForDisplay(): string {
  return getApiBaseUrl()
}

export async function checkHealth(): Promise<HealthResponse> {
  return fetchJson<HealthResponse>("/health", { method: "GET" })
}

export async function getCategories(): Promise<CategoriesResponse> {
  return fetchJson<CategoriesResponse>("/categories", { method: "GET" })
}

export async function startSession(req: StartSessionRequest): Promise<StartSessionResponse> {
  return fetchJson<StartSessionResponse>("/sessions/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      category: req.category,
      targetRole: req.targetRole,
      language: req.language ?? "ko",
    }),
  })
}

export async function postTextTurn(params: {
  sessionId: string
  text: string
}): Promise<TurnResponse> {
  return fetchJson<TurnResponse>(
    `/sessions/${encodeURIComponent(params.sessionId)}/turns/text`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: params.text }),
    },
    TURN_FETCH_TIMEOUT_MS
  )
}

export async function endSession(sessionId: string): Promise<EndSessionResponse> {
  return fetchJson<EndSessionResponse>(
    `/sessions/${encodeURIComponent(sessionId)}/end`,
    { method: "POST" }
  )
}

export async function startFreeTalk(sessionId: string): Promise<StartFreeTalkResponse> {
  return fetchJson<StartFreeTalkResponse>(
    `/sessions/${encodeURIComponent(sessionId)}/freetalk/start`,
    { method: "POST" }
  )
}

export async function postFreeTalkText(params: {
  sessionId: string
  text: string
}): Promise<FreeTalkResponse> {
  return fetchJson<FreeTalkResponse>(
    `/sessions/${encodeURIComponent(params.sessionId)}/freetalk/text`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: params.text }),
    },
    TURN_FETCH_TIMEOUT_MS
  )
}

export function isAppropriateJudgement(judgement: string): boolean {
  const j = judgement.toUpperCase()
  return j === "APPROPRIATE" || j === "OK" || j === "SUCCESS"
}
