import { useRef, useState } from 'react';

import { ApiError } from '@/api/client';
import { Input, InputActionButton } from '@/components/common/Input';
import { useSendEmailCode } from '@/queries/auth/useSendEmailCode';

import { AUTH_MESSAGE } from '../../(auth)/_constants/authMessage';
import { getSendEmailErrorMessage } from '../../(auth)/_lib/emailVerification';
import { validateEmail } from '../../(auth)/_lib/validation';

type EmailStepProps = {
  email: string;
  onEmailChange: (email: string) => void;
  onNext: (expiresInSeconds: number) => void;
  onSocialPasswordResetUnsupported: (error: ApiError) => void;
  emailDisabled?: boolean;
  actionDisabled?: boolean;
};

export default function EmailStep({
  email,
  onEmailChange,
  onNext,
  onSocialPasswordResetUnsupported,
  emailDisabled,
  actionDisabled,
}: EmailStepProps) {
  const sendInFlight = useRef(false);
  const [emailError, setEmailError] = useState<string>();
  const { mutateAsync: sendEmailCode, isPending } = useSendEmailCode();

  const handleSendEmail = async () => {
    if (actionDisabled || sendInFlight.current || isPending) return;
    const normalizedEmail = email.trim();
    const error = validateEmail(normalizedEmail);

    if (error) {
      setEmailError(error);
      return;
    }

    sendInFlight.current = true;
    setEmailError(undefined);

    try {
      const result = await sendEmailCode({ email: normalizedEmail, purpose: 'password-reset' });

      if (!result.success) {
        setEmailError(AUTH_MESSAGE.EMAIL.SEND_FAILED);
        return;
      }

      onEmailChange(normalizedEmail);
      onNext(result.expiresInSeconds);
    } catch (error) {
      if (error instanceof ApiError && error.code === 'SOCIAL_PASSWORD_RESET_UNSUPPORTED') {
        onSocialPasswordResetUnsupported(error);
        return;
      }

      setEmailError(getSendEmailErrorMessage(error, 'password-reset'));
    } finally {
      sendInFlight.current = false;
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <h2 className="text-[20px] font-bold">비밀번호 재설정</h2>

      <Input
        label="아이디"
        name="email"
        type="email"
        value={email}
        onChange={(e) => {
          setEmailError(undefined);
          onEmailChange(e.target.value);
        }}
        placeholder="이메일 입력"
        disabled={emailDisabled || isPending}
        errorMessage={emailError}
        rightAddon={
          <InputActionButton
            type="button"
            onClick={handleSendEmail}
            disabled={actionDisabled || isPending}
          >
            {isPending ? '발송 중' : '메일발송'}
          </InputActionButton>
        }
        className="h-10 px-2 font-medium tracking-normal"
        showMessageSpace
      />
    </div>
  );
}
