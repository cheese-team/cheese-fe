import { useState } from 'react';

import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';

import { useResetPassword } from '@/queries/auth/useResetPassword';

import { AUTH_MESSAGE } from '../../(auth)/_constants/authMessage';
import { validatePassword, validatePasswordConfirmation } from '../../(auth)/_lib/validation';

type NewPasswordStepProps = {
  email: string;
  onComplete: () => void;
};

export default function NewPasswordStep({ email, onComplete }: NewPasswordStepProps) {
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');

  const [passwordError, setPasswordError] = useState<string>();
  const [passwordConfirmationError, setPasswordConfirmationError] = useState<string>();

  const { mutateAsync: resetPassword, isPending: isResetPasswordPending } = useResetPassword();

  const passwordValidationError = validatePassword(newPassword);
  const confirmationValidationError = validatePasswordConfirmation(
    newPassword,
    newPasswordConfirmation,
  );

  const isPasswordMatched =
    !passwordValidationError && !confirmationValidationError && newPasswordConfirmation.length > 0;

  const handleSetPasswordComplete = async () => {
    setPasswordError(undefined);
    setPasswordConfirmationError(undefined);

    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }

    if (confirmationValidationError) {
      setPasswordConfirmationError(confirmationValidationError);
      return;
    }

    try {
      const resetPasswordResult = await resetPassword({
        email,
        newPassword,
        newPasswordConfirmation,
      });

      if (!resetPasswordResult.success) {
        setPasswordError(AUTH_MESSAGE.PASSWORD.RESET_FAILED);
        return;
      }

      onComplete();
    } catch {
      setPasswordError(AUTH_MESSAGE.PASSWORD.RESET_FAILED);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <h2 className="text-[20px] font-bold">비밀번호 변경</h2>

      <div className="flex flex-col gap-5">
        <Input
          label="새로운 비밀번호"
          name="newPassword"
          type="password"
          value={newPassword}
          onChange={(event) => {
            setNewPassword(event.target.value);
            setPasswordError(undefined);
            setPasswordConfirmationError(undefined);
          }}
          placeholder="새로운 비밀번호 (영문,숫자,특수문자 포함 8자)"
          disabled={isResetPasswordPending}
          errorMessage={passwordError}
          className="h-10 px-2 font-medium tracking-normal"
        />
        <Input
          label="새로운 비밀번호 확인"
          name="newPasswordConfirm"
          type="password"
          value={newPasswordConfirmation}
          onChange={(event) => {
            setNewPasswordConfirmation(event.target.value);
            setPasswordConfirmationError(undefined);
          }}
          placeholder="비밀번호 재입력"
          disabled={isResetPasswordPending}
          errorMessage={passwordConfirmationError}
          successMessage={isPasswordMatched ? AUTH_MESSAGE.PASSWORD.MATCHED : undefined}
          className="h-10 px-2 font-medium tracking-normal"
        />
      </div>

      <Button
        variant="light"
        type="button"
        onClick={handleSetPasswordComplete}
        disabled={isResetPasswordPending}
        className="text-[16px]"
      >
        비밀번호 변경
      </Button>
    </div>
  );
}
