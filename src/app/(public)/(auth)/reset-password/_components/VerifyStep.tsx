import EmailVerifyForm from '../../_components/EmailVerifyForm';

type VerifyStepProps = {
  initialEmail?: string;
  onNext: (email: string) => void;
};

export default function VerifyStep({ initialEmail, onNext }: VerifyStepProps) {
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
      onNext={onNext}
    />
  );
}
