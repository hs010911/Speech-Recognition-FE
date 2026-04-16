# AI-Based Interactive Korean Honorific Learning (Frontend Prototype)

백엔드/AI 연동 전 단계의 프론트엔드 프로토타입입니다.  
현재는 화면 흐름, 음성 입력/재생, 시나리오 진행을 프론트에서 확인할 수 있습니다.

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## 현재 구현 범위

- 주제 선택 화면 (`집`, `나이`, `밥`, `이름`)
- 시나리오형 대화 UI (질문/지시 -> 답변 -> 피드백)
- 브라우저 음성 인식(Web Speech API)
- 브라우저 음성 재생(TTS, 한국어/러시아어 안내)
- MediaRecorder 기반 음성 Blob 생성(업로드 준비)

## 폴더 구조

```text
sp/
  app/
    layout.tsx              # 앱 공통 레이아웃/메타데이터
    page.tsx                # 메인 진입 페이지
    globals.css             # 전역 스타일
  components/
    conversation-screen.tsx # 대화 진행/피드백/시나리오 로직
    voice-input.tsx         # 음성 인식 + 녹음 + 전송 콜백
    chat-message.tsx        # 메시지 렌더링 + TTS 버튼
    topic-selection.tsx     # 주제 선택 UI
    grandfather-avatar.tsx  # 아바타 SVG
    ui/                     # shadcn/radix 기반 UI 컴포넌트
  lib/
    speech.ts               # 브라우저 TTS helper
    ui-strings.ts           # 한국어/러시아어 고정 문구
    utils.ts                # 공통 유틸(cn 등)
  public/
    icon.svg                # 파비콘
```

## 백엔드/AI 연동 포인트

코드에 `TODO(BE 연동)` / `TODO(AI 연동)` 주석을 추가해 두었습니다.

### 1) 시나리오 데이터 로딩

- 현재: `components/conversation-screen.tsx`의 `topicData` 하드코딩
- 연동 후: `GET /api/scenarios?topic=...` 형태로 받아 state에 저장

### 2) 존댓말 평가(AI/NLP)

- 현재: `analyzeResponse()` 규칙 매칭
- 연동 후: `POST /api/evaluate`
  - 요청 예시: `{ topic, scenarioId, userText }`
  - 응답 예시: `{ type, message, suggestion }`

### 3) 음성 업로드/STT

- 현재: `voice-input.tsx`에서 `audioBlob` 생성 후 상위로 전달
- 연동 후: `FormData`로 `POST /api/stt` 업로드 -> 텍스트 수신

### 4) 추천 API 흐름

1. 음성 입력 시 `audioBlob` 업로드 (`/api/stt`)
2. STT 텍스트 확보 후 평가 API 호출 (`/api/evaluate`)
3. 평가 결과를 `feedback` UI에 반영
4. 성공이면 다음 시나리오로 진행

## 다음 작업 체크리스트

- [ ] `lib/api.ts` 추가 (API 함수 분리)
- [ ] API 호출 중 로딩/에러/재시도 UI
- [ ] 시나리오/피드백 타입을 서버 스키마와 동기화
- [ ] iOS Safari 포함 모바일 권한/호환성 테스트
- [ ] (선택) 서버 TTS로 교체

