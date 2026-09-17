'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import EmailStep from './_components/EmailStep';
import VerifyStep from './_components/VerifyStep';
import NewPasswordStep from './_components/NewPasswordStep';
import AuthConfirmModal from '../_components/AuthConfirmModal';
import AuthCard from '../_components/AuthCard';

import { useCurrentUser } from '@/queries/auth/useCurrentUser';

type Step = 'EMAIL' | 'VERIFY' | 'NEW_PASSWORD';

export default function ResetPasswordPage() {
  const router = useRouter();

  const { data: user, isPending } = useCurrentUser();

  const [step, setStep] = useState<Step>('EMAIL');
  const [email, setEmail] = useState('');
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [isDoneOpen, setIsDoneOpen] = useState(false);

  const displayedEmail = user?.account.email ?? email;

  const handlePasswordResetComplete = () => {
    setIsDoneOpen(false);

    router.push(user ? '/mypage' : '/login');
  };

  return (
    <AuthCard>
      {step === 'EMAIL' && (
        <EmailStep
          email={displayedEmail}
          onEmailChange={setEmail}
          onNext={() => setStep('VERIFY')}
          emailDisabled={isPending || !!user}
          actionDisabled={isPending}
        />
      )}

      {step === 'VERIFY' && (
        <VerifyStep
          initialEmail={displayedEmail}
          emailDisabled={isPending || !!user}
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
        primaryText={user ? '마이페이지로 돌아가기' : '로그인하러 가기'}
        onPrimaryClick={handlePasswordResetComplete}
      />
    </AuthCard>
  );
}
