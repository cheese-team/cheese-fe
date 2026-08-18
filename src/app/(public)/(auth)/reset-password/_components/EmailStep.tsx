import { useState } from 'react';

import { Input, InputActionButton } from '@/components/common/Input';

import { validateEmail } from '@/lib/validation';
import { AUTH_MESSAGE } from '@/constants/auth';

type EmailStepProps = {
  email: string;
  onEmailChange: (email: string) => void;
  onNext: () => void;
};

export default function EmailStep({ email, onEmailChange, onNext }: EmailStepProps) {
  const [emailError, setEmailError] = useState<string>();

  const handleSendEmail = async () => {
    const error = validateEmail(email);

    if (error) {
      setEmailError(error);
      return;
    }

    setEmailError(undefined);

    try {
      // TODO: 비밀번호 재설정 메일 발송 API
      // TODO: API 에러 코드에 따라 미가입 이메일과 발송 실패 구분
      onNext();
    } catch {
      setEmailError(AUTH_MESSAGE.EMAIL.UNREGISTERED);
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
        errorMessage={emailError}
        rightAddon={
          <InputActionButton type="button" onClick={handleSendEmail}>
            메일발송
          </InputActionButton>
        }
        className="h-10 px-2 font-medium tracking-normal"
        showMessageSpace
      />
    </div>
  );
}
