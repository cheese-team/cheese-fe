import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';

type NewPasswordStepProps = {
  onComplete: () => void;
};

export default function NewPasswordStep({ onComplete }: NewPasswordStepProps) {
  return (
    <div className="flex flex-col gap-10">
      <h2 className="text-[20px] font-bold">비밀번호 변경</h2>

      <div className="flex flex-col gap-5">
        <Input
          label="새로운 비밀번호"
          placeholder="새로운 비밀번호 (영문,숫자,특수문자 포함 8자)"
          type="password"
          name="newPassword"
          errorMessage={'영문, 숫자, 특수문자를 포함하여 8자 이상이어야합니다.'}
        />
        <Input
          label="새로운 비밀번호 확인"
          placeholder="비밀번호 재입력"
          type="password"
          name="newPasswordConfirm"
          errorMessage={'비밀번호가 일치하지 않습니다.'}
          successMessage={'비밀번호가 일치합니다'}
        />
      </div>

      <Button type="button" onClick={onComplete}>
        변경 완료
      </Button>
    </div>
  );
}
