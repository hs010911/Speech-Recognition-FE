# AI-Based Interactive Korean Honorific Learning (Frontend)

팀 백엔드(FastAPI)와 REST API로 연동하는 존댓말 학습 프론트엔드(Next.js)입니다.

## 실행 방법 (CMD 두 개)

### 1) 백엔드

```cmd
cd C:\Users\hanse\Desktop\Speech-Recognition-Team-2-Formal-Speech-Conversion-BE-main
pip install fastapi uvicorn pydantic joblib pandas scikit-learn
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

> 이 저장소에는 `requirements.txt`가 없습니다. 위 `pip install`로 설치하세요.

→ `http://localhost:8000` · API 문서: `http://localhost:8000/docs`

PC가 버벅이면 uvicorn에 `--reload`를 붙이지 마세요.

### 2) 프론트엔드

```cmd
cd C:\Users\hanse\Desktop\sr
copy .env.example .env.local
npm install
npm run dev:light
```

→ Chrome에서 `http://localhost:3000`

**Windows에서는 `npm run dev:light`를 권장합니다.** (`next dev --webpack` — Turbopack보다 안정적인 경우가 많음)

| 명령 | 설명 |
|------|------|
| `npm run dev:light` | **권장** — Webpack 개발 서버 |
| `npm run dev` | Turbopack (`next dev`) — 느리거나 오류 나면 `dev:light` 사용 |

`.env.local` 예시:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

**3000 포트가 이미 쓰일 때:**

```cmd
taskkill /IM node.exe /F
```

## 연동된 API

| 메서드 | 경로 | 용도 |
|--------|------|------|
| GET | `/api/health` | 서버 상태 |
| GET | `/api/categories` | 주제 목록 |
| POST | `/api/sessions/start` | 세션 시작 |
| POST | `/api/sessions/{id}/turns/text` | 텍스트 평가·피드백 |
| POST | `/api/sessions/{id}/end` | 세션 종료 |

음성은 브라우저 STT로 텍스트로 바꾼 뒤 `POST /turns/text`로 보냅니다.

## 주요 파일

```text
lib/api.ts
lib/session-messages.ts
lib/categories.ts
lib/speech.ts
components/conversation-screen.tsx
components/topic-selection.tsx
app/page.tsx
```

## 평가 응답 → UI

- `evaluation.judgement`: `APPROPRIATE` → 성공 스타일
- `scenario.nextAction`: `RETRY` | `NEXT` | `END`
