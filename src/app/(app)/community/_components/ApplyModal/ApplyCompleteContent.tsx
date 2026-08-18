import { Button } from '@/components/common/Button';

import CheckCircleIcon from '@/assets/icons/common/CheckCircleIcon';
import ArrowIcon from '@/assets/icons/common/arrow.svg';

type ApplyCompleteContentProps = {
  title: string;
  onMoveApplications?: () => void;
};

export default function ApplyCompleteContent({
  title,
  onMoveApplications,
}: ApplyCompleteContentProps) {
  return (
    <section className="flex flex-col items-center gap-8">
      <div className="flex w-full flex-col items-center gap-5 leading-6">
        <div className="bg-tag-green-100 flex h-20 w-20 items-center justify-center rounded-full">
          <CheckCircleIcon className="h-10 w-10" circleColor="var(--color-tag-green-500)" />
        </div>

        <h2 className="text-[24px] font-bold">지원이 완료되었습니다!</h2>

        <div className="flex w-full flex-col gap-3">
          <h3 className="font-bold">지원내용</h3>
          <p className="font-medium">{title}</p>
        </div>
      </div>

      <Button onClick={onMoveApplications} width={182} size={54} className="gap-2 leading-[30px]">
        내 지원현황
        <ArrowIcon className="h-3 rotate-180" />
      </Button>
    </section>
  );
}
