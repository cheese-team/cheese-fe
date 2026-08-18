'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import EmailStep from './_components/EmailStep';
import VerifyStep from './_components/VerifyStep';
import NewPasswordStep from './_components/NewPasswordStep';
import AuthConfirmModal from '../_components/AuthConfirmModal';

type Step = 'EMAIL' | 'VERIFY' | 'NEW_PASSWORD';

export default function ResetPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [verifiedEmail, setVerifiedEmail] = useState('');

  const [step, setStep] = useState<Step>('EMAIL');
  const [isDoneOpen, setIsDoneOpen] = useState(false);

  const handlePasswordResetComplete = () => {
    setIsDoneOpen(false);
    router.push('/login');
  };

  return (
    <>
      {step === 'EMAIL' && (
        <EmailStep email={email} onEmailChange={setEmail} onNext={() => setStep('VERIFY')} />
      )}

      {step === 'VERIFY' && (
        <VerifyStep
          initialEmail={email}
          onNext={(email) => {
            setVerifiedEmail(email);
            setStep('NEW_PASSWORD');
          }}
        />
      )}

      {step === 'NEW_PASSWORD' && (
        <NewPasswordStep email={verifiedEmail} onComplete={() => setIsDoneOpen(true)} />
      )}

      <AuthConfirmModal
        isOpen={isDoneOpen}
        title="비밀번호 변경 완료"
        description="비밀번호가 성공적으로 변경되었습니다"
        primaryText="로그인하러 가기"
        onPrimaryClick={handlePasswordResetComplete}
      />
    </>
  );
}
