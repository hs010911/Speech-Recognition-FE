# AI-Based Interactive Korean Honorific Learning (Frontend)

팀 백엔드(FastAPI)와 REST API로 연동하는 존댓말 학습 프론트엔드(Next.js)입니다.

## 실행 방법 (CMD 두 개)

### 1) 백엔드

```cmd
cd C:\Users\hanse\Desktop\Speech-Recognition-Team-2-Formal-Speech-Conversion-BE-main
python -m pip install fastapi uvicorn pydantic joblib pandas scikit-learn openai python-dotenv
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

> `requirements.txt`가 없으면 위 패키지를 한 번 설치하세요.  
> `pip`/`python`이 MSYS 등 다른 Python을 가리키면 Miniconda 전체 경로를 쓰세요.  
> 예: `C:\Users\hanse\miniconda3\python.exe -m pip install ...`  
> 예: `C:\Users\hanse\miniconda3\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000`

→ `http://127.0.0.1:8000` · 헬스: `http://127.0.0.1:8000/api/health` · 문서: `http://127.0.0.1:8000/docs`

터미널에 `Uvicorn running on http://127.0.0.1:8000`이 보이면 백엔드 기동 성공입니다. PC가 버벅이면 `--reload`는 빼도 됩니다.

`models/formality_classifier.joblib`이 없으면 백엔드 폴더에서 `train_classifier.py`를 먼저 실행하세요.

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
