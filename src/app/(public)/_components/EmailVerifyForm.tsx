import { useState } from 'react';

import { Input, InputActionButton } from '@/components/common/Input';
import { Button } from '@/components/common/Button';

import { useSendEmailCode } from '@/queries/auth/useSendEmailCode';
import { useVerifyEmailCode } from '@/queries/auth/useVerifyEmailCode';

import { AUTH_MESSAGE } from '../(auth)/_constants/authMessage';
import { validateEmail } from '../(auth)/_lib/validation';
import { getSendEmailErrorMessage } from '../(auth)/_lib/emailVerification';

import type { EmailVerificationPurpose } from '@/api/auth.api';

export type EmailVerifyBaseProps = {
  title?: string;
  description?: React.ReactNode;
  initialEmail?: string;
  initialStatus?: EmailVerifyStatus;
  onNext: (email: string) => void;
  emailDisabled?: boolean;
  purpose: EmailVerificationPurpose;
};

export type EmailVerifyStatus =
  | 'IDLE'
  | 'SENDING'
  | 'SENT'
  | 'SEND_ERROR'
  | 'VERIFYING'
  | 'VERIFIED';

type EmailVerifyFormProps = EmailVerifyBaseProps;

export default function EmailVerifyForm({
  title,
  description,
  initialEmail = '',
  initialStatus = 'IDLE',
  onNext,
  emailDisabled,
  purpose,
}: EmailVerifyFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const [sentEmail, setSentEmail] = useState(initialEmail);
  const [status, setStatus] = useState<EmailVerifyStatus>(initialStatus);
  const [emailError, setEmailError] = useState<string>();

  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState<string>();

  const { mutateAsync: sendEmailCode } = useSendEmailCode();
  const { mutateAsync: verifyEmailCode } = useVerifyEmailCode();

  const isSending = status === 'SENDING';
  const isVerifying = status === 'VERIFYING';
  const isVerified = status === 'VERIFIED';

  const hasSentEmail = status === 'SENT' || isVerifying || isVerified;
  const isEmailLocked = isSending || isVerifying || isVerified || emailDisabled;
  const isSentEmail = email === sentEmail;

  const handleSend = async () => {
    const normalizedEmail = email.trim();
    const validationError = validateEmail(normalizedEmail);

    if (validationError) {
      setEmailError(validationError);
      return;
    }

    setEmailError(undefined);
    setStatus('SENDING');

    try {
      const sendEmailCodeResult = await sendEmailCode({
        email: normalizedEmail,
        purpose,
      });

      if (!sendEmailCodeResult.success) {
        setStatus('SEND_ERROR');
        setEmailError(AUTH_MESSAGE.EMAIL.SEND_FAILED);
        return;
      }

      setEmail(normalizedEmail);
      setSentEmail(normalizedEmail);
      setVerificationCode('');
      setVerificationError(undefined);
      setStatus('SENT');
    } catch (error) {
      setStatus('SEND_ERROR');
      setEmailError(getSendEmailErrorMessage(error, purpose));
    }
  };

  const handleVerify = async () => {
    if (!isSentEmail) return;

    const code = verificationCode.trim();

    if (!code) {
      setVerificationError(AUTH_MESSAGE.VERIFICATION.REQUIRED);
      return;
    }

    setVerificationError(undefined);
    setStatus('VERIFYING');

    try {
      const verifyEmailCodeResult = await verifyEmailCode({
        email: sentEmail,
        code,
      });

      if (!verifyEmailCodeResult.verified) {
        setStatus('SENT');
        setVerificationError(AUTH_MESSAGE.VERIFICATION.INVALID);
        return;
      }

      setStatus('VERIFIED');
    } catch {
      setStatus('SENT');
      setVerificationError(AUTH_MESSAGE.VERIFICATION.INVALID);
    }
  };

  const handleNext = () => {
    if (!isVerified) return;

    onNext(sentEmail);
  };

  return (
    <div>
      {title && <h2 className="pb-10 text-[20px] font-bold tracking-normal">{title}</h2>}

      <form className="flex flex-col gap-5">
        <Input
          autoFocus
          label="아이디(이메일)"
          name="email"
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setEmailError(undefined);
          }}
          placeholder="아이디 (이메일) 입력"
          disabled={isEmailLocked}
          errorMessage={emailError}
          successMessage={hasSentEmail && isSentEmail ? AUTH_MESSAGE.EMAIL.SEND_SUCCESS : undefined}
          rightAddon={
            <InputActionButton
              onClick={handleSend}
              disabled={isSending || isVerifying || isVerified}
            >
              {hasSentEmail && isSentEmail ? '재발송' : '메일발송'}
            </InputActionButton>
          }
          className="h-10 px-2 font-medium tracking-normal"
          showMessageSpace
        />

        <Input
          label="인증번호"
          name="verificationCode"
          type="text"
          inputMode="numeric"
          value={verificationCode}
          onChange={(event) => {
            setVerificationCode(event.target.value);
            setVerificationError(undefined);
          }}
          placeholder="인증번호 입력"
          disabled={!hasSentEmail || !isSentEmail || isVerifying || isVerified}
          errorMessage={verificationError}
          successMessage={isVerified ? AUTH_MESSAGE.VERIFICATION.MATCHED : undefined}
          rightAddon={
            <InputActionButton
              onClick={handleVerify}
              disabled={!hasSentEmail || !isSentEmail || isVerifying || isVerified}
            >
              인증하기
            </InputActionButton>
          }
          className="h-10 px-2 font-medium tracking-normal"
          showMessageSpace
        />

        {description && (
          <div className="text-xs leading-[17px] tracking-[-0.03em] text-gray-500">
            {description}
          </div>
        )}

        <Button
          variant="light"
          aria-label="다음"
          onClick={handleNext}
          disabled={!isVerified}
          className="text-[16px]"
        >
          다음
        </Button>
      </form>
    </div>
  );
}
