import { useQuery } from '@tanstack/react-query';

import { getMemos, getWidgetMemos } from '@/api/memo.api';

import { memoQueryKeys } from './memoQueryKeys';

import type { Memo } from '@/app/(app)/memo/_types/memo';

const WIDGET_MEMO_LIMIT = 5;

type UseMemosParams = {
  enabled: boolean;
};

export type MemoQueryData = {
  memos: Memo[];
  widgetMemos: Memo[];
};

export function useMemos({ enabled }: UseMemosParams) {
  return useQuery({
    queryKey: memoQueryKeys.data(),
    queryFn: async ({ signal }): Promise<MemoQueryData> => {
      const [activeMemos, deletedMemos, widgetMemos] = await Promise.all([
        getMemos({ signal }),
        getMemos({ deleted: true, signal }),
        getWidgetMemos({ limit: WIDGET_MEMO_LIMIT, signal }),
      ]);

      return {
        memos: [...activeMemos, ...deletedMemos],
        widgetMemos,
      };
    },
    enabled,
  });
}
