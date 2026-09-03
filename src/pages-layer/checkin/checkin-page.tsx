import { resolveCheckinSession } from "@/domains/checkin";

import { CheckinStateScreen } from "./ui/checkin-state-screen";
import { RetryButton } from "./ui/retry-button";

interface CheckinPageProps {
  token: string;
}

export async function CheckinPage({ token }: CheckinPageProps) {
  const result = await resolveCheckinSession(token);

  switch (result.status) {
    case "active": {
      const name = result.session.displayName ? `${result.session.displayName}님` : "안녕하세요";
      return (
        <CheckinStateScreen
          title={`${name}, 체크인을 준비했어요`}
          description="채팅형 체크인 화면은 다음 구현 단계에서 이 세션 정보와 연결됩니다."
        />
      );
    }
    case "completed":
      return (
        <CheckinStateScreen
          title="이번 체크인은 이미 답변해 주셨어요"
          description="감사합니다 😊 이제 이 창을 닫으셔도 돼요."
        />
      );
    case "expired":
      return (
        <CheckinStateScreen
          title="이 체크인은 기간이 지났어요"
          description="다음 체크인 때 다시 뵐게요!"
        />
      );
    case "invalid":
      return (
        <CheckinStateScreen
          title="링크가 올바르지 않아요"
          description="카카오톡으로 받으신 링크로 다시 들어와 주세요."
          role="alert"
        />
      );
    case "error":
      return (
        <CheckinStateScreen
          title="일시적인 문제가 생겼어요"
          description="잠시 후 다시 시도해 주세요."
          action={<RetryButton />}
          role="alert"
        />
      );
  }
}
