import { useState } from 'react';

import { Input, InputActionButton } from '@/components/common/Input';

import { validateEmail } from '../../(auth)/_lib/validation';

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

  const handleSendEmail = () => {
    if (actionDisabled) return;
    const normalizedEmail = email.trim();
    const error = validateEmail(normalizedEmail);

    if (error) {
      setEmailError(error);
      return;
    }

    setEmailError(undefined);

    onEmailChange(normalizedEmail);
    onNext();
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
        disabled={emailDisabled}
        errorMessage={emailError}
        rightAddon={
          <InputActionButton type="button" onClick={handleSendEmail} disabled={actionDisabled}>
            메일발송
          </InputActionButton>
        }
        className="h-10 px-2 font-medium tracking-normal"
        showMessageSpace
      />
    </div>
  );
}
