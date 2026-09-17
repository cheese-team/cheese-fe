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
  userId: string;
  memoId: string;
};

export type SaveMemoVariables = {
  userId: string;
  memo: MemoSavePayload;
  currentMemo?: Memo;
};

export type ToggleMemoPinVariables = MemoMutationVariables & {
  pinned: boolean;
};

export type DeleteSelectedMemosVariables = {
  userId: string;
  memoIds: string[];
};

function useInvalidateMemoData() {
  const queryClient = useQueryClient();

  return (userId: string) =>
    queryClient.invalidateQueries({
      queryKey: memoQueryKeys.byUser(userId),
    });
}

export function useSaveMemoMutation() {
  const invalidateMemoData = useInvalidateMemoData();

  return useMutation({
    mutationFn: async ({ userId, memo, currentMemo }: SaveMemoVariables) => {
      const uploadedFile = memo.imageFile
        ? // TODO: JWT 인증 방식 전환 시 확인
          // 기존 코드: await uploadFile({ userId, file: memo.imageFile })
          await uploadFile({ file: memo.imageFile })
        : null;
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
        return createMemo({ userId, draft });
      }

      let savedMemo = await updateMemo({
        userId,
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
          userId,
          memoId: currentMemo.id,
          pinned: Boolean(draft.pinned),
        });
      }

      return savedMemo;
    },
    onSettled: async (_data, _error, variables) => {
      await invalidateMemoData(variables.userId);
    },
  });
}

export function useToggleMemoPinMutation() {
  const invalidateMemoData = useInvalidateMemoData();

  return useMutation({
    mutationFn: ({ userId, memoId, pinned }: ToggleMemoPinVariables) =>
      updateMemoPin({ userId, memoId, pinned }),
    onSettled: async (_data, _error, variables) => {
      await invalidateMemoData(variables.userId);
    },
  });
}

export function useDeleteMemoMutation() {
  const invalidateMemoData = useInvalidateMemoData();

  return useMutation({
    mutationFn: ({ userId, memoId }: MemoMutationVariables) => deleteMemo({ userId, memoId }),
    onSettled: async (_data, _error, variables) => {
      await invalidateMemoData(variables.userId);
    },
  });
}

export function useDeleteSelectedMemosMutation() {
  const invalidateMemoData = useInvalidateMemoData();

  return useMutation({
    mutationFn: async ({ userId, memoIds }: DeleteSelectedMemosVariables) => {
      const results = await Promise.allSettled(
        memoIds.map((memoId) => deleteMemo({ userId, memoId })),
      );
      const rejectedResult = results.find((result) => result.status === 'rejected');

      if (rejectedResult?.status === 'rejected') {
        throw rejectedResult.reason;
      }

      return results.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []));
    },
    onSettled: async (_data, _error, variables) => {
      await invalidateMemoData(variables.userId);
    },
  });
}

export function useRestoreMemoMutation() {
  const invalidateMemoData = useInvalidateMemoData();

  return useMutation({
    mutationFn: ({ userId, memoId }: MemoMutationVariables) => restoreMemo({ userId, memoId }),
    onSettled: async (_data, _error, variables) => {
      await invalidateMemoData(variables.userId);
    },
  });
}

export function usePermanentDeleteMemoMutation() {
  const invalidateMemoData = useInvalidateMemoData();

  return useMutation({
    mutationFn: ({ userId, memoId }: MemoMutationVariables) =>
      permanentDeleteMemo({ userId, memoId }),
    onSettled: async (_data, _error, variables) => {
      await invalidateMemoData(variables.userId);
    },
  });
}
