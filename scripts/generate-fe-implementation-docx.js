/**
 * 프론트엔드 기능·주요 코드 상세 설명서 (.docx)
 * 실행: node scripts/generate-fe-implementation-docx.js
 */
const fs = require("fs");
const path = require("path");
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
} = require("docx");

const children = [];

function h1(t) {
  children.push(new Paragraph({ text: t, heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 180 } }));
}
function h2(t) {
  children.push(new Paragraph({ text: t, heading: HeadingLevel.HEADING_2, spacing: { before: 260, after: 100 } }));
}
function h3(t) {
  children.push(new Paragraph({ text: t, heading: HeadingLevel.HEADING_3, spacing: { before: 180, after: 60 } }));
}
function p(t) {
  children.push(new Paragraph({ children: [new TextRun({ text: t })], spacing: { after: 100 } }));
}
function bullet(t) {
  children.push(new Paragraph({ text: t, bullet: { level: 0 }, spacing: { after: 50 } }));
}
function fileLabel(fp) {
  children.push(
    new Paragraph({
      spacing: { before: 120, after: 40 },
      children: [new TextRun({ text: fp, bold: true, color: "2563EB", size: 20 })],
    })
  );
}
function code(lines) {
  const text = (Array.isArray(lines) ? lines : [lines]).join("\n");
  children.push(
    new Paragraph({
      spacing: { before: 40, after: 140 },
      border: {
        top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
        left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
        right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      },
      shading: { fill: "F8FAFC" },
      children: [new TextRun({ text, font: "Consolas", size: 16 })],
    })
  );
}
function tbl(rows) {
  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: rows.map(
        (cells) =>
          new TableRow({
            children: cells.map(
              (text) =>
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text, size: 18 })] })],
                })
            ),
          })
      ),
    })
  );
  children.push(new Paragraph({ spacing: { after: 120 } }));
}

// ─── 문서 본문 ───
children.push(
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({ text: "Speech-Recognition-FE", bold: true, size: 40 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [new TextRun({ text: "프론트엔드 기능 구현 상세 설명서", size: 28 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
    children: [new TextRun({ text: "본 문서만으로 프로젝트 구조·동작·코드를 이해할 수 있도록 작성", size: 20, color: "666666" })],
  })
);

h1("0. 이 문서의 목적");
p("팀 백엔드(FastAPI)와 연동하는 한국어 존댓말 학습 웹 앱의 프론트엔드(speech-recognition-fe) 구현 내용을 정리합니다.");
p("코드 저장소를 열지 않아도 다음을 파악할 수 있도록 구성했습니다: 사용 기술, 화면 흐름, API 연동, 상태 관리, 주요 파일 역할, 핵심 코드 패턴, 실행 방법, 오류 대응.");

h1("1. 프로젝트 개요");
bullet("목적: 외국인 학습자가 할아버지/친구 상황에서 존댓말·반말을 대화형으로 연습");
bullet("역할: UI·음성 입력·채팅 표시·번역·TTS. 평가·시나리오 진행은 백엔드 담당");
bullet("저장소: GitHub Speech-Recognition-FE (로컬 폴더명 예: sr)");
bullet("실행 URL: http://localhost:3000 (프론트), http://localhost:8000 (백엔드 API)");

h2("1.1 시스템 구성");
code([
  "[사용자 Chrome]",
  "    | Web Speech API (STT/TTS, 브라우저)",
  "    | fetch REST",
  "    v",
  "[Next.js 프론트 :3000]  lib/api.ts, conversation-screen.tsx ...",
  "    | HTTP JSON",
  "    v",
  "[FastAPI 백엔드 :8000]  scenario_service, evaluator, session_store",
  "    | (시나리오 하드코딩, 규칙/분류기 평가)",
  "    v",
  "[메모리 세션] sessionId, currentStepIndex",
]);

h2("1.2 프론트가 하지 않는 것");
bullet("음성 파일을 서버에 업로드하는 /turns/speech — 미사용");
bullet("시나리오 문장·평가 규칙 생성 — 백엔드 SCENARIOS / rule_engine");
bullet("DB 저장 — 세션은 백엔드 메모리, 프론트는 sessionId만 보관");

h1("2. 기술 스택");
tbl([
  ["구분", "기술", "용도"],
  ["프레임워크", "Next.js 16 (App Router)", "페이지 라우팅, SSR/클라이언트 컴포넌트"],
  ["UI 라이브러리", "React 19", "상태·이벤트·컴포넌트"],
  ["언어", "TypeScript 5.7", "API 타입, ChatMessageModel 등"],
  ["스타일", "Tailwind CSS 4", "반응형·말풍선·그리드"],
  ["UI 컴포넌트", "shadcn 스타일 Button (components/ui/button.tsx)", "뒤로가기·마이크·전송 버튼"],
  ["아이콘", "lucide-react", "ArrowLeft, Mic, Send, Volume2"],
  ["음성 인식", "Web Speech API (SpeechRecognition)", "마이크 → 한국어 텍스트"],
  ["음성 합성", "window.speechSynthesis", "한국어/러시아어 듣기"],
  ["HTTP", "fetch + AbortController", "백엔드 REST, 4초 타임아웃"],
  ["번역", "Google Translate 비공식 API (클라이언트)", "한국어 → 러시아어 subtitle"],
  ["환경변수", "NEXT_PUBLIC_API_BASE_URL", ".env.local"],
]);

h1("3. 프로젝트 폴더 구조");
code([
  "sr/",
  "  app/",
  "    page.tsx          ← 메인/대화 화면 전환 (진입점)",
  "    layout.tsx        ← HTML lang=ko, 메타데이터",
  "    globals.css       ← Tailwind 테마",
  "  components/",
  "    conversation-screen.tsx  ← 대화·평가·이어하기 핵심",
  "    topic-selection.tsx        ← 주제·역할 선택",
  "    chat-message.tsx           ← 말풍선·피드백·음성버튼",
  "    voice-input.tsx            ← STT + 텍스트 입력",
  "    grandfather-avatar.tsx     ← 👴 프로필",
  "    friend-avatar.tsx          ← 👦 프로필",
  "    user-avatar.tsx            ← 😊 사용자 프로필",
  "    ui/button.tsx              ← 공통 버튼",
  "  lib/",
  "    api.ts              ← 백엔드 REST 클라이언트·타입",
  "    speech.ts           ← STT/TTS",
  "    translate.ts        ← 한→러 번역+캐시",
  "    session-messages.ts ← 시나리오→채팅 메시지",
  "    categories.ts       ← 주제 메타, home→birthday",
  "    target-roles.ts     ← 할아버지/친구, 지원 주제",
  "    ui-strings.ts       ← 고정 UI 문구(한·러)",
  "    utils.ts            ← cn() 클래스 병합",
  "  types/speech-recognition.d.ts  ← 브라우저 STT 타입",
  "  .env.example / .env.local",
  "  package.json",
]);

h1("4. 환경 설정 및 실행");
h2("4.1 사전 요구");
bullet("Node.js 18+ , npm");
bullet("Python 3 + FastAPI 백엔드 (별도 폴더)");
bullet("Chrome 또는 Edge (Web Speech STT 권장)");

h2("4.2 백엔드 실행");
code([
  "cd Speech-Recognition-Team-2-Formal-Speech-Conversion-BE-main",
  "pip install fastapi uvicorn pydantic joblib pandas scikit-learn",
  "uvicorn app.main:app --host 127.0.0.1 --port 8000",
  "확인: http://localhost:8000/docs",
]);

h2("4.3 프론트 실행");
code([
  "cd sr",
  "copy .env.example .env.local",
  "  내용: NEXT_PUBLIC_API_BASE_URL=http://localhost:8000",
  "npm install",
  "npm run dev:light",
  "브라우저: http://localhost:3000",
]);

p("Windows에서 dev 서버가 무거우면 npm run dev 대신 dev:light(Webpack) 사용.");
p("포트 3000 점유 시: taskkill /IM node.exe /F");

h1("5. 화면 구성과 사용자 흐름");
h2("5.1 메인 화면 (app/page.tsx)");
p("상태가 selectedTopic && sessionId && sessionStart 가 없으면 메인을 표시합니다.");
tbl([
  ["UI 영역", "동작"],
  ["헤더", "앱 제목 한·러 (homeCopy)"],
  ["👴 / 👦 클릭", "targetRole 변경 → 제목·주제 버튼 활성 변경"],
  ["역할 버튼 2개", "할아버지 / 친구 (topic-selection 내부)"],
  ["주제 4칸", "food, age, name, birthday — 클릭 시 startSession"],
  ["푸터", "기능 안내 bullet"],
]);

h3("메인 화면 state (page.tsx)");
tbl([
  ["state", "의미"],
  ["targetRole", "선택 중인 연습 상대 (아이콘·topic-selection 공유)"],
  ["selectedTopic", "선택한 주제 id"],
  ["selectedTargetRole", "세션 시작 시 사용한 역할"],
  ["sessionId", "백엔드 세션 ID"],
  ["sessionStart", "start API 응답 전체"],
  ["isStarting", "세션 시작 로딩"],
  ["startError", "시작 실패 메시지"],
]);

h3("주제 클릭 시 처리");
code([
  "const resp = await startSession({",
  "  category: topic,        // 예: 'age'",
  "  targetRole: role,       // 'grandfather' | 'friend'",
  "  language: 'ko',",
  "});",
  "setSessionId(data.sessionId);",
  "setSessionStart(data);",
  "→ ConversationScreen 렌더링",
]);

h2("5.2 대화 화면 (conversation-screen.tsx)");
bullet("헤더: 뒤로가기 → endSession 후 메인 복귀");
bullet("currentTargetRole 기준 프로필·이름 (이어하기 시 역할 변경 가능)");
bullet("채팅 목록: messages[] → ChatMessage");
bullet("하단: VoiceInput (완료·제출 중 비활성)");

h1("6. 백엔드 API 연동 (lib/api.ts)");
p("모든 요청은 { success: boolean, data?: T } 형태를 가정합니다. Base: NEXT_PUBLIC_API_BASE_URL + /api");

h2("6.1 GET /health");
code(['반환: { success: true, data: { status: "ok" } }']);

h2("6.2 GET /categories");
code([
  "반환 data: [",
  '  { id: "food", name: "밥" },',
  '  { id: "name", name: "이름" }, ...',
  "]",
  "실패 시: FALLBACK_CATEGORIES (lib/categories.ts)",
]);

h2("6.3 POST /sessions/start");
code([
  "요청 body:",
  '{ "category": "age", "targetRole": "grandfather", "language": "ko" }',
  "",
  "응답 data 주요 필드:",
  "  sessionId, category, targetRole,",
  "  prompt,              // 지시문 (예: 할아버지에게 나이를 물어보세요)",
  "  systemUtterance,     // 할아버지 대사 (answer 스텝에만)",
  "  recommendedAnswers, currentStepId, turnType",
]);

h2("6.4 POST /sessions/{sessionId}/turns/text");
code([
  "요청: { text: 사용자 입력 문자열 }",
  "",
  "응답 data:",
  "  transcript,",
  "  evaluation: { judgement, score, levels, errorTypes },",
  "  feedback: { message, recommendedAnswer, alternatives },",
  "  scenario: {",
  "    nextAction: 'RETRY' | 'NEXT' | 'END',",
  "    nextStep, nextQuestion, prompt, ...",
  "  }",
]);

h3("judgement → UI");
p("isAppropriateJudgement(): APPROPRIATE, OK, SUCCESS 이면 성공 스타일 피드백.");

h2("6.5 POST /sessions/{sessionId}/end");
p("뒤로 가기 시 호출. 실패해도 화면은 나감.");

h2("6.6 공통: fetchJson");
bullet("AbortController 4초 타임아웃");
bullet("실패 시 FastAPI detail 파싱 또는 상태 코드 메시지");

h1("7. 시나리오 진행 (백엔드 + 프론트 해석)");
p("시나리오 내용은 백엔드 scenario_service.py SCENARIOS에 하드코딩. 프론트는 API 응답만 표시.");

h2("7.1 첫 메시지 변환 (session-messages.ts)");
code([
  "messagesFromSessionStart(sessionStart):",
  "  1) systemUtterance 있으면 → 봇 말풍선 1개",
  "  2) prompt가 utterance와 다르면 → 봇 말풍선 1개 더",
  "ask 스텝: prompt만 / answer 스텝: 할아버지 대사 + 지시",
]);

h2("7.2 턴 평가 후 nextAction");
tbl([
  ["nextAction", "프론트 동작"],
  ["RETRY", "사용자 말풍선 + 피드백. 재시도 안내 말풍선(RETRY_HINT + prompt + 예시)"],
  ["NEXT", "사용자 말풍선 + 피드백. messagesAfterNextStep으로 다음 봇 메시지 추가"],
  ["END", "완료 메시지. isComplete=true. (나이·이름) 반대 역할 이어하기 제안"],
]);

h2("7.3 할아버지 ↔ 친구 이어하기 (프론트 전용)");
p("조건: supportsFriendRole(topic) → age, name 만.");
code([
  "END 후 showFollowUpOfferIfNeeded():",
  '  "할아버지 연습을 끝냈어요. 이어서 친구로 같은 주제를 연습할까요?"',
  "  버튼: [네, 친구로 이어서] [아니요]",
  "",
  "승인 시 startFollowUp(nextRole):",
  "  - 새 startSession (같은 category, 반대 targetRole)",
  "  - currentSessionId, currentTargetRole 갱신",
  "  - 기존 messages 유지 + 전환 안내 + 새 첫 스텝 메시지",
  "  - 각 메시지 botRole 저장 → 과거 말풍선 아이콘 유지",
]);

h2("7.4 역할별 지원 주제 (lib/target-roles.ts)");
tbl([
  ["targetRole", "백엔드 시나리오 있는 주제"],
  ["grandfather", "food, age, name, birthday 전부"],
  ["friend", "age, name (food/birthday 버튼 비활성)"],
]);

h1("8. 채팅 메시지 모델 (ChatMessageModel)");
tbl([
  ["필드", "설명"],
  ["id", "고유 id (uid)"],
  ["text", "표시할 한국어 본문"],
  ["isUser", "true=사용자(오른쪽), false=봇(왼쪽)"],
  ["subtitleRu", "봇 메시지 아래 러시아어 번역"],
  ["ruChecked", "번역 시도 완료 여부"],
  ["botRole", "이 메시지를 말한 상대 (아이콘 고정용)"],
  ["offerNextRole", "이어하기 제안 시 다음 역할"],
  ["feedback", "사용자 메시지 아래 피드백 박스"],
  ["feedback.type", "success | correction"],
  ["feedback.messageRu", "피드백 러시아어 + TTS"],
]);

h1("9. 기능별 상세 구현");

h2("9.1 음성 인식 STT (lib/speech.ts + voice-input.tsx)");
bullet("SpeechRecognition / webkitSpeechRecognition");
bullet("continuous=true, interimResults=true, lang=ko-KR");
bullet("committedRef + interim → inputText 실시간 반영");
bullet("전송: handleSend → onSendMessage(text) → postTextTurn");
fileLabel("lib/speech.ts");
code([
  "export function startSpeechRecognition(callbacks, lang='ko-KR')",
  "export function isSpeechRecognitionSupported(): boolean",
]);

h2("9.2 음성 합성 TTS (lib/speech.ts)");
code([
  "speakText(text, 'ko-KR' | 'ru-RU')",
  "new SpeechSynthesisUtterance(text)",
  "말풍선 Volume2 버튼: 한국어 본문 / 러시아어 subtitleRu / 피드백 messageRu",
]);

h2("9.3 한→러 번역 (lib/translate.ts)");
bullet("translateKoToRu(text): Google translate_a/single, client=gtx");
bullet("Map 캐시로 동일 문장 재요청 방지");
bullet("conversation-screen useEffect: ruChecked=false인 봇 메시지 일괄 번역");
bullet("피드백: postTextTurn 직후 feedbackRu await");

h2("9.4 채팅 UI (chat-message.tsx)");
bullet("카카오톡 스타일: 프로필 + 말풍선");
bullet("botRole ?? targetRole 로 아이콘 결정 (과거 메시지 보존)");
bullet("한국어 줄 + Volume2 / 러시아어 줄 + Volume2 분리");
bullet("피드백: amber(교정) / emerald(성공)");

h2("9.5 주제 선택 (topic-selection.tsx)");
bullet("마운트 시 getCategories()");
bullet("친구 선택 시 food·birthday disabled (opacity-40)");
bullet("normalizeCategoryId: home → birthday");

h1("10. conversation-screen 핵심 state");
tbl([
  ["state", "역할"],
  ["currentTargetRole", "현재 세션 역할 (헤더·신규 메시지)"],
  ["currentSessionId", "postTextTurn에 사용"],
  ["completedRoles", "grandfather/friend 각각 END 완료 여부"],
  ["messages", "채팅 전체"],
  ["isComplete", "END 후 입력 잠금"],
  ["isSubmitting", "평가/이어하기 중"],
  ["statusNote", "하단 에러·안내"],
]);

h1("11. handleSendMessage 처리 순서");
bullet("1. postTextTurn(sessionId, text)");
bullet("2. 사용자 ChatMessage 추가 (feedback 포함, messageRu 번역)");
bullet("3. nextAction 분기: END / NEXT / RETRY");
bullet("4. 봇 메시지 추가 시 botRole: currentTargetRole 부여");

h1("12. 타입 정의 (lib/api.ts 요약)");
p("StartSessionData, TurnResponseData, ScenarioStep, TurnEvaluation, TurnFeedback, TurnScenario — TypeScript로 응답 구조 고정.");

h1("13. UI 문구 (lib/ui-strings.ts)");
p("homeCopy: titleKo/Ru, topicHint, roleHint, friendTopicNote, bullets, footer — 메인 화면 고정 텍스트.");

h1("14. 카테고리 (lib/categories.ts)");
p("CATEGORY_META: korean, russian, label. getTopicHeader → '나이 (возраст)'. FALLBACK_CATEGORIES 4개.");

h1("15. 오류·예외 처리");
tbl([
  ["상황", "동작"],
  ["카테고리 API 실패", "로컬 FALLBACK + 안내 문구"],
  ["세션 시작 실패", "startError 빨간색 + uvicorn 안내"],
  ["fetch 타임아웃 4초", "백엔드 실행 확인 메시지"],
  ["STT 미지원", "텍스트만 입력 안내"],
  ["빈 입력 전송", "statusNote"],
  ["endSession 실패", "무시하고 메인 복귀"],
  ["번역 실패", "subtitleRu/messageRu 없음, 한국어만 표시"],
]);

h1("16. 백엔드 연동 시 주의사항");
bullet("프론트는 /turns/text 만 사용 (음성 파일 업로드 없음)");
bullet("시나리오·평가 로직 변경은 백엔드 수정 필요");
bullet("업데이트된 백엔드가 evaluator 연결 미완성이면 turns/text 500 가능 — 팀 BE 안정 버전 필요");
bullet("classifierResult 필드는 optional, FE 미사용");

h1("17. 개발·빌드 명령");
tbl([
  ["명령", "설명"],
  ["npm run dev", "Turbopack 개발 서버"],
  ["npm run dev:light", "Webpack 개발 서버 (권장)"],
  ["npm run build", "프로덕션 빌드"],
  ["npm run start", "빌드 후 실행"],
  ["npx tsc --noEmit", "타입 검사"],
]);

h1("18. 파일별 역할 전체 목록");
tbl([
  ["파일", "역할"],
  ["app/page.tsx", "앱 루트, 메인↔대화 전환, startSession 호출"],
  ["app/layout.tsx", "레이아웃, favicon icon.svg"],
  ["app/globals.css", "Tailwind, CSS 변수"],
  ["components/conversation-screen.tsx", "대화·평가·번역·이어하기"],
  ["components/topic-selection.tsx", "주제·역할 UI"],
  ["components/chat-message.tsx", "말풍선 렌더"],
  ["components/voice-input.tsx", "입력·STT"],
  ["components/*-avatar.tsx", "이모지 프로필"],
  ["lib/api.ts", "REST 클라이언트"],
  ["lib/speech.ts", "STT/TTS"],
  ["lib/translate.ts", "번역"],
  ["lib/session-messages.ts", "시나리오→메시지"],
  ["lib/target-roles.ts", "역할·지원주제"],
  ["lib/categories.ts", "주제 메타"],
  ["lib/ui-strings.ts", "문구"],
  ["lib/utils.ts", "cn()"],
  ["types/speech-recognition.d.ts", "STT 타입"],
  [".env.local", "API URL (git 제외)"],
]);

h1("19. 시퀀스 예시: 한 턴 성공 (NEXT)");
code([
  "1. 사용자: '연세가 어떻게 되세요?' 입력/음성",
  "2. POST /turns/text",
  "3. judgement=APPROPRIATE → feedback 초록 말풍선",
  "4. nextAction=NEXT → nextStep.prompt/systemUtterance 채팅 추가",
  "5. useEffect → 새 봇 메시지 러시아어 subtitleRu 부착",
  "6. 백엔드 session currentStepIndex++",
]);

h1("20. 문서 갱신");
p("재생성: node scripts/generate-fe-implementation-docx.js (docx 패키지 필요)");
p("출력: Speech-Recognition-FE_기능구현_설명.docx");

const doc = new Document({
  sections: [{ properties: {}, children }],
});

const outPath = path.join(__dirname, "..", "Speech-Recognition-FE_기능구현_설명.docx");
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outPath, buffer);
  console.log("생성 완료:", outPath);
});
