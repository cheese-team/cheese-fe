import { Input, InputActionButton } from '@/components/common/Input';

type EmailStepProps = {
  onNext: () => void;
};

export default function EmailStep({ onNext }: EmailStepProps) {
  return (
    <div className="flex flex-col gap-10">
      <h2 className="text-[20px] font-bold">비밀번호 재설정</h2>

      <Input
        label="아이디"
        placeholder="이메일 입력"
        type="email"
        name="email"
        rightAddon={
          <InputActionButton type="button" onClick={onNext}>
            메일발송
          </InputActionButton>
        }
        errorMessage={'이메일이 올바르지 않습니다'}
      />
    </div>
  );
}
