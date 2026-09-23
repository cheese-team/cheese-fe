import { useMutation, useQueryClient } from '@tanstack/react-query';

import { uploadFile } from '@/api/files.api';
import {
  createMemo,
  deleteMemo,
  permanentDeleteMemo,
  restoreMemo,
  updateMemo,
  updateMemoPin,
  type MemoDraft,
} from '@/api/memo.api';
import { stripHtml } from '@/app/(app)/memo/_lib/memoText';

import { memoQueryKeys } from './memoQueryKeys';

import type { Memo, MemoSavePayload } from '@/app/(app)/memo/_types/memo';

type MemoMutationVariables = {
  memoId: string;
};

export type SaveMemoVariables = {
  memo: MemoSavePayload;
  currentMemo?: Memo;
};

export type ToggleMemoPinVariables = MemoMutationVariables & {
  pinned: boolean;
};

export type DeleteSelectedMemosVariables = {
  memoIds: string[];
};

function useInvalidateMemoData() {
  const queryClient = useQueryClient();

  return () =>
    queryClient.invalidateQueries({
      queryKey: memoQueryKeys.data(),
    });
}

export function useSaveMemoMutation() {
  const invalidateMemoData = useInvalidateMemoData();

  return useMutation({
    mutationFn: async ({ memo, currentMemo }: SaveMemoVariables) => {
      const uploadedFile = memo.imageFile ? await uploadFile({ file: memo.imageFile }) : null;
      const draft: MemoDraft = {
        title: memo.title.trim() || '제목',
        contentHtml: memo.content,
        contentText: stripHtml(memo.content),
        color: memo.color ?? 'gray',
        pinned: Boolean(memo.pinned),
        imageFileId:
          uploadedFile?.id ??
          (memo.imageFileId !== undefined ? memo.imageFileId : currentMemo?.imageFileId),
      };

      if (!currentMemo) {
        return createMemo({ draft });
      }

      let savedMemo = await updateMemo({
        memoId: currentMemo.id,
        draft: {
          title: draft.title,
          contentHtml: draft.contentHtml,
          contentText: draft.contentText,
          color: draft.color,
          imageFileId: draft.imageFileId,
        },
      });

      if (Boolean(currentMemo.pinned) !== Boolean(draft.pinned)) {
        savedMemo = await updateMemoPin({
          memoId: currentMemo.id,
          pinned: Boolean(draft.pinned),
        });
      }

      return savedMemo;
    },
    onSettled: async () => {
      await invalidateMemoData();
    },
  });
}

export function useToggleMemoPinMutation() {
  const invalidateMemoData = useInvalidateMemoData();

  return useMutation({
    mutationFn: ({ memoId, pinned }: ToggleMemoPinVariables) => updateMemoPin({ memoId, pinned }),
    onSettled: async () => {
      await invalidateMemoData();
    },
  });
}

export function useDeleteMemoMutation() {
  const invalidateMemoData = useInvalidateMemoData();

  return useMutation({
    mutationFn: ({ memoId }: MemoMutationVariables) => deleteMemo({ memoId }),
    onSettled: async () => {
      await invalidateMemoData();
    },
  });
}

export function useDeleteSelectedMemosMutation() {
  const invalidateMemoData = useInvalidateMemoData();

  return useMutation({
    mutationFn: async ({ memoIds }: DeleteSelectedMemosVariables) => {
      const results = await Promise.allSettled(memoIds.map((memoId) => deleteMemo({ memoId })));
      const rejectedResult = results.find((result) => result.status === 'rejected');

      if (rejectedResult?.status === 'rejected') {
        throw rejectedResult.reason;
      }

      return results.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []));
    },
    onSettled: async () => {
      await invalidateMemoData();
    },
  });
}

export function useRestoreMemoMutation() {
  const invalidateMemoData = useInvalidateMemoData();

  return useMutation({
    mutationFn: ({ memoId }: MemoMutationVariables) => restoreMemo({ memoId }),
    onSettled: async () => {
      await invalidateMemoData();
    },
  });
}

export function usePermanentDeleteMemoMutation() {
  const invalidateMemoData = useInvalidateMemoData();

  return useMutation({
    mutationFn: ({ memoId }: MemoMutationVariables) => permanentDeleteMemo({ memoId }),
    onSettled: async () => {
      await invalidateMemoData();
    },
  });
}
