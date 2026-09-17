import { useState } from 'react';

import { Input, InputActionButton } from '@/components/common/Input';

import { validateEmail } from '@/lib/validation';
import { AUTH_MESSAGE } from '@/constants/auth';
import { useSendEmailCode } from '@/queries/auth/useSendEmailCode';

type EmailStepProps = {
  email: string;
  onEmailChange: (email: string) => void;
  onNext: () => void;
  emailDisabled?: boolean;
  actionDisabled?: boolean;
};

export default function EmailStep({
  email,
  onEmailChange,
  onNext,
  emailDisabled,
  actionDisabled,
}: EmailStepProps) {
  const [emailError, setEmailError] = useState<string>();

  const { mutateAsync: sendEmailCode, isPending: isSending } = useSendEmailCode();

  const handleSendEmail = async () => {
    const normalizedEmail = email.trim();
    const error = validateEmail(normalizedEmail);

    if (error) {
      setEmailError(error);
      return;
    }

    setEmailError(undefined);

    try {
      const sendEmailCodeResult = await sendEmailCode({
        email: normalizedEmail,
        purpose: 'password-reset',
      });

      if (!sendEmailCodeResult.success) {
        setEmailError(AUTH_MESSAGE.EMAIL.SEND_FAILED);
        return;
      }

      onEmailChange(normalizedEmail);
      onNext();
    } catch {
      setEmailError(AUTH_MESSAGE.EMAIL.SEND_FAILED);
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
        disabled={emailDisabled || isSending}
        errorMessage={emailError}
        rightAddon={
          <InputActionButton
            type="button"
            onClick={handleSendEmail}
            disabled={actionDisabled || isSending}
          >
            메일발송
          </InputActionButton>
        }
        className="h-10 px-2 font-medium tracking-normal"
        showMessageSpace
      />
    </div>
  );
}
