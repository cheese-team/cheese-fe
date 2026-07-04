import EmailVerifyForm from '../../_components/EmailVerifyForm';

type VerifyStepProps = {
  onNext: () => void;
};

export default function VerifyStep({ onNext }: VerifyStepProps) {
  return (
    <EmailVerifyForm
      title="비밀번호 재설정"
      description={
        <>
          이메일 인증이 완료되면 임시 비밀번호가 이메일로 발송됩니다.
          <br />
          로그인 후 비밀번호를 재설정 해주세요.
        </>
      }
      onNext={onNext}
    />
  );
}
