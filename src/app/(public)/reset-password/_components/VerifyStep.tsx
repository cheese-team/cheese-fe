import EmailVerifyForm from '../../_components/EmailVerifyForm';

import type { ApiError } from '@/api/client';

type VerifyStepProps = {
  initialEmail?: string;
  initialRemainingSeconds: number;
  onNext: (email: string) => void;
  onSocialPasswordResetUnsupported: (error: ApiError) => void;
  emailDisabled?: boolean;
};

export default function VerifyStep({
  initialEmail,
  initialRemainingSeconds,
  onNext,
  onSocialPasswordResetUnsupported,
  emailDisabled,
}: VerifyStepProps) {
  return (
    <EmailVerifyForm
      title="비밀번호 재설정"
      description={
        <>
          이메일로 발송된 인증번호를 입력해 주세요.
          <br />
          인증이 완료되면 새 비밀번호를 설정할 수 있습니다.
        </>
      }
      initialEmail={initialEmail}
      initialStatus="SENT"
      initialRemainingSeconds={initialRemainingSeconds}
      onNext={onNext}
      onSocialPasswordResetUnsupported={onSocialPasswordResetUnsupported}
      emailDisabled={emailDisabled}
      purpose="password-reset"
    />
  );
}
