import { Button } from '@/components/common/Button';

import { APPLY_LABEL } from './constants';

import type { ApplyInfo } from '@/types/community';

export default function JobApplyAction({
  apply,
  onDirectApply,
  isClosed,
}: {
  apply: ApplyInfo;
  onDirectApply: () => void;
  isClosed: boolean;
}) {
  if (isClosed) {
    return (
      <Button width={100} variant="gray" disabled>
        채용 마감
      </Button>
    );
  }

  if (apply.type === 'homepage') {
    return (
      <Button asChild width={100} variant="outlineGray">
        <a href={apply.url} target="_blank" rel="noopener noreferrer">
          {APPLY_LABEL[apply.type]}
        </a>
      </Button>
    );
  }

  return (
    <Button width={100} onClick={onDirectApply} disabled={isClosed}>
      {APPLY_LABEL[apply.type]}
    </Button>
  );
}
