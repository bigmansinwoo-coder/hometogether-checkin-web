# 홈투게더 정기 체크인

카카오톡 알림톡 링크에서 열리는 입주자용 채팅형 정기 체크인 웹입니다. 만족도 조사보다 개입이 필요한 생활·관계·시설·정산 문제를 조기에 감지하는 것이 목적입니다.

## 현재 범위

PR D 입주자 회차별 시나리오 범위까지 구현되어 있습니다.

- Next.js App Router + TypeScript + Tailwind CSS v4
- `/c/[token]` 일회성 토큰 라우트
- 목 세션 해석과 `active/completed/expired/invalid/error` 상태 분기
- 실제 API 교체 경계: `src/domains/checkin/api`
- 카카오 인앱 웹뷰를 위한 no-store·no-referrer 헤더
- 기존 홈투게더 디자인 토큰과 `BtnCta` 재사용
- 옵션형 결정론적 상태머신과 답변 기록·중복 방지 제출
- 말풍선·아바타·옵션 버튼·하단 고정 컨트롤
- 사용자가 이전 대화를 읽을 때 방해하지 않는 자동 스크롤
- 월간 불편 태그·예측 칩·선택적 자유어 입력
- 최대 2개 이슈 구조화와 R1/R2 결정론적 트리아지
- 백엔드 교체에 대비한 버전형 제출 payload

각 목 토큰에서 온보딩 D+7, 첫 월간, 일반 월간, 재계약, 시설·규칙 이벤트의 전용 흐름을 확인할 수 있습니다.

## 실행

```bash
pnpm install
pnpm dev
```

정상 월간 목 세션은 `http://localhost:3000/c/demo-monthly`에서 확인할 수 있습니다.

## 목 토큰

| 주소 | 상태 |
| --- | --- |
| `/c/demo-monthly` | 월간 정상 세션 |
| `/c/demo-onboarding` | 온보딩 D+7 |
| `/c/demo-monthly-first` | 첫 월간 |
| `/c/demo-renewal` | 재계약 회차 |
| `/c/demo-event-facility` | 시설 이벤트 |
| `/c/demo-event-rule` | 규칙 이벤트 |
| `/c/demo-completed` | 이미 응답함 |
| `/c/demo-expired` | 만료 |
| `/c/demo-invalid` | 무효 |
| `/c/demo-error` | 오류 |

## 검증

```bash
pnpm typecheck
pnpm lint
pnpm build
```

## 백엔드 연결 경계

현재 DB와 전송 방식은 미정이며 `src/domains/checkin/api`만 목 구현입니다. UI는 완료 시 아래 구조의 `schemaVersion: 1` payload를 한 번 제출합니다.

```json
{
  "schemaVersion": 1,
  "sessionId": "session-monthly",
  "idempotencyKey": "session-monthly:monthly-guest:v1",
  "answers": {
    "responses": { "monthlyStatus": "issue" },
    "issues": [
      { "tag": "facility", "detail": "leak", "triageLevel": "R2" }
    ],
    "freeText": "천장에서 물이 떨어져요.",
    "overallTriage": "R2"
  }
}
```

실제 API를 붙일 때는 서버가 토큰과 세션의 관계, 중복 제출, payload 버전을 검증해야 합니다. DB 테이블 구조와 토큰 전달 방식은 백엔드 확정 후 이 계약을 기준으로 결정합니다.

## 주요 제약

- URL에 PII를 넣지 않습니다.
- 팝업과 `window.open`을 사용하지 않습니다.
- localStorage에 응답 상태를 저장하지 않습니다.
- 본인인증·결제·회원가입을 넣지 않습니다.
- 시나리오 판단은 결정론적 규칙으로만 구현합니다.
