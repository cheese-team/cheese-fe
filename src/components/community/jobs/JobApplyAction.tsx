import { Button } from '@/components/common/Button';

import { APPLY_LABEL } from './constants';

import type { ApplyInfo } from '@/types/community/community';

export default function JobApplyAction({
  apply,
  onDirectApply,
  isClosed,
  isApplied = false,
  isApplyPending = false,
}: {
  apply: ApplyInfo;
  onDirectApply: () => void;
  isClosed: boolean;
  isApplied?: boolean;
  isApplyPending?: boolean;
}) {
  if (isApplied) {
    return (
      <Button width={100} variant="gray" disabled className="font-bold">
        지원 완료
      </Button>
    );
  }

  if (isClosed) {
    return (
      <Button width={100} variant="gray" disabled className="font-bold">
        채용 마감
      </Button>
    );
  }

  if (apply.type === 'homepage') {
    return (
      <Button asChild width={100} variant="outlineGray" className="font-bold">
        <a href={apply.url} target="_blank" rel="noopener noreferrer">
          {APPLY_LABEL[apply.type]}
        </a>
      </Button>
    );
  }

  return (
    <Button width={100} onClick={onDirectApply} disabled={isClosed || isApplyPending}>
      {isApplyPending ? '지원 중...' : APPLY_LABEL[apply.type]}
    </Button>
  );
}
