'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { ApiError } from '@/api/client';
import { useCurrentUser } from '@/queries/auth/useCurrentUser';
import {
  useDeleteMemoMutation,
  useDeleteSelectedMemosMutation,
  usePermanentDeleteMemoMutation,
  useRestoreMemoMutation,
  useSaveMemoMutation,
  useToggleMemoPinMutation,
} from '@/queries/memo/useMemoMutations';
import { useMemos } from '@/queries/memo/useMemos';

import type { Memo, MemoSavePayload } from '../_types/memo';

export type { MemoSavePayload } from '../_types/memo';

type MemoMutationStatus = 'success' | 'not-found' | 'loading' | 'cancelled' | 'error';

type MemoSelectionState = {
  ownerUserId: string | null;
  selectedIds: Set<string>;
};

type MemoStoreContextValue = {
  memos: Memo[];
  widgetMemos: Memo[];
  isLoading: boolean;
  errorMessage: string | null;
  saveMemo: (memo: MemoSavePayload) => Promise<MemoMutationStatus>;
  toggleSelectMemo: (id: string) => void;
  selectMemos: (ids: string[], selected: boolean) => void;
  togglePinMemo: (id: string) => Promise<MemoMutationStatus>;
  deleteMemo: (id: string) => Promise<MemoMutationStatus>;
  deleteSelectedMemos: () => Promise<MemoMutationStatus>;
  restoreMemo: (id: string) => Promise<MemoMutationStatus>;
  permanentDeleteMemo: (id: string) => Promise<MemoMutationStatus>;
};

const MemoStoreContext = createContext<MemoStoreContextValue | null>(null);
const EMPTY_MEMOS: Memo[] = [];
const EMPTY_SELECTED_IDS = new Set<string>();

function getMemoErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

function getMutationErrorMessage(
  error: unknown,
  fallback: string,
) {
  if (!error) {
    return null;
  }

  return getMemoErrorMessage(error, fallback);
}

function updateSelection(
  state: MemoSelectionState,
  userId: string,
  updateSelectedIds: (selectedIds: Set<string>) => void,
): MemoSelectionState {
  const selectedIds = new Set(state.ownerUserId === userId ? state.selectedIds : []);
  updateSelectedIds(selectedIds);

  return { ownerUserId: userId, selectedIds };
}

export function MemoStoreProvider({ children }: { children: ReactNode }) {
  const {
    data: currentUser,
    error: currentUserError,
    isPending: isCurrentUserPending,
    isRefetchError: isCurrentUserRefetchError,
  } = useCurrentUser();
  const sessionUserId = currentUser?.account.userId;
  const hasCurrentUserError = Boolean(currentUserError) || isCurrentUserRefetchError;
  const canLoadMemoData = Boolean(sessionUserId) && !hasCurrentUserError;
  const {
    data: memoQueryData,
    error: memoQueryError,
    isPending: isMemoQueryPending,
  } = useMemos({ enabled: canLoadMemoData });
  const {
    mutateAsync: saveMemoAsync,
    reset: resetSaveMemo,
    error: saveMemoError,
  } = useSaveMemoMutation();
  const {
    mutateAsync: toggleMemoPinAsync,
    reset: resetToggleMemoPin,
    error: toggleMemoPinError,
  } = useToggleMemoPinMutation();
  const {
    mutateAsync: deleteMemoAsync,
    reset: resetDeleteMemo,
    error: deleteMemoError,
  } = useDeleteMemoMutation();
  const {
    mutateAsync: deleteSelectedMemosAsync,
    reset: resetDeleteSelectedMemos,
    error: deleteSelectedMemosError,
  } = useDeleteSelectedMemosMutation();
  const {
    mutateAsync: restoreMemoAsync,
    reset: resetRestoreMemo,
    error: restoreMemoError,
  } = useRestoreMemoMutation();
  const {
    mutateAsync: permanentDeleteMemoAsync,
    reset: resetPermanentDeleteMemo,
    error: permanentDeleteMemoError,
  } = usePermanentDeleteMemoMutation();
  const [selectionState, setSelectionState] = useState<MemoSelectionState>({
    ownerUserId: null,
    selectedIds: new Set(),
  });

  const selectedIds =
    selectionState.ownerUserId === sessionUserId
      ? selectionState.selectedIds
      : EMPTY_SELECTED_IDS;
  const sourceMemos = canLoadMemoData ? (memoQueryData?.memos ?? EMPTY_MEMOS) : EMPTY_MEMOS;
  const memos = useMemo(
    () =>
      sourceMemos.map((memo) => ({
        ...memo,
        selected: selectedIds.has(memo.id),
      })),
    [selectedIds, sourceMemos],
  );
  const widgetMemos = canLoadMemoData ? (memoQueryData?.widgetMemos ?? EMPTY_MEMOS) : EMPTY_MEMOS;
  const isMemoLoading =
    isCurrentUserPending || (canLoadMemoData && isMemoQueryPending && !memoQueryData);

  const resetMutationErrors = useCallback(() => {
    resetSaveMemo();
    resetToggleMemoPin();
    resetDeleteMemo();
    resetDeleteSelectedMemos();
    resetRestoreMemo();
    resetPermanentDeleteMemo();
  }, [
    resetDeleteMemo,
    resetDeleteSelectedMemos,
    resetPermanentDeleteMemo,
    resetRestoreMemo,
    resetSaveMemo,
    resetToggleMemoPin,
  ]);

  const clearSelectedMemoIds = useCallback(
    (memoIds: string[]) => {
      if (!sessionUserId) return;

      setSelectionState((state) =>
        updateSelection(state, sessionUserId, (nextSelectedIds) => {
          memoIds.forEach((memoId) => nextSelectedIds.delete(memoId));
        }),
      );
    },
    [sessionUserId],
  );

  const saveMemo = useCallback(
    async (nextMemo: MemoSavePayload): Promise<MemoMutationStatus> => {
      if (isMemoLoading) {
        return 'loading';
      }

      if (!canLoadMemoData) {
        return 'error';
      }

      const currentMemo = nextMemo.id ? memos.find((memo) => memo.id === nextMemo.id) : undefined;

      if (nextMemo.id && !currentMemo) {
        return 'not-found';
      }

      resetMutationErrors();

      try {
        await saveMemoAsync({
          memo: nextMemo,
          currentMemo,
        });
        return 'success';
      } catch (error) {
        if (error instanceof ApiError && error.status === 404 && nextMemo.id) {
          resetSaveMemo();
          return 'not-found';
        }

        return 'error';
      }
    },
    [
      canLoadMemoData,
      isMemoLoading,
      memos,
      resetMutationErrors,
      resetSaveMemo,
      saveMemoAsync,
    ],
  );

  const toggleSelectMemo = useCallback(
    (id: string) => {
      if (!sessionUserId) return;

      setSelectionState((state) =>
        updateSelection(state, sessionUserId, (nextSelectedIds) => {
          if (nextSelectedIds.has(id)) {
            nextSelectedIds.delete(id);
          } else {
            nextSelectedIds.add(id);
          }
        }),
      );
    },
    [sessionUserId],
  );

  const selectMemos = useCallback(
    (ids: string[], selected: boolean) => {
      if (!sessionUserId) return;

      setSelectionState((state) =>
        updateSelection(state, sessionUserId, (nextSelectedIds) => {
          ids.forEach((id) => {
            if (selected) {
              nextSelectedIds.add(id);
            } else {
              nextSelectedIds.delete(id);
            }
          });
        }),
      );
    },
    [sessionUserId],
  );

  const togglePinMemo = useCallback(
    async (id: string): Promise<MemoMutationStatus> => {
      if (isMemoLoading) {
        return 'loading';
      }

      if (!canLoadMemoData) {
        return 'error';
      }

      const currentMemo = memos.find((memo) => memo.id === id);

      if (!currentMemo) {
        return 'not-found';
      }

      resetMutationErrors();

      try {
        await toggleMemoPinAsync({
          memoId: id,
          pinned: !currentMemo.pinned,
        });
        return 'success';
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          resetToggleMemoPin();
          return 'not-found';
        }

        return 'error';
      }
    },
    [
      canLoadMemoData,
      isMemoLoading,
      memos,
      resetMutationErrors,
      resetToggleMemoPin,
      toggleMemoPinAsync,
    ],
  );

  const deleteMemo = useCallback(
    async (id: string): Promise<MemoMutationStatus> => {
      if (isMemoLoading) {
        return 'loading';
      }

      if (!canLoadMemoData) {
        return 'error';
      }

      resetMutationErrors();

      try {
        await deleteMemoAsync({ memoId: id });
        clearSelectedMemoIds([id]);
        return 'success';
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          resetDeleteMemo();
          clearSelectedMemoIds([id]);
          return 'not-found';
        }

        return 'error';
      }
    },
    [
      clearSelectedMemoIds,
      deleteMemoAsync,
      canLoadMemoData,
      isMemoLoading,
      resetDeleteMemo,
      resetMutationErrors,
    ],
  );

  const deleteSelectedMemos = useCallback(async (): Promise<MemoMutationStatus> => {
    if (isMemoLoading) {
      return 'loading';
    }

    if (!canLoadMemoData) {
      return 'error';
    }

    const selectedMemoIds = memos
      .filter((memo) => memo.selected && !memo.deleted)
      .map((memo) => memo.id);

    if (selectedMemoIds.length === 0) {
      return 'success';
    }

    resetMutationErrors();

    try {
      await deleteSelectedMemosAsync({
        memoIds: selectedMemoIds,
      });
      clearSelectedMemoIds(selectedMemoIds);
      return 'success';
    } catch {
      return 'error';
    }
  }, [
    clearSelectedMemoIds,
    deleteSelectedMemosAsync,
    canLoadMemoData,
    isMemoLoading,
    memos,
    resetMutationErrors,
  ]);

  const restoreMemo = useCallback(
    async (id: string): Promise<MemoMutationStatus> => {
      if (isMemoLoading) {
        return 'loading';
      }

      if (!canLoadMemoData) {
        return 'error';
      }

      resetMutationErrors();

      try {
        await restoreMemoAsync({ memoId: id });
        clearSelectedMemoIds([id]);
        return 'success';
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          resetRestoreMemo();
          clearSelectedMemoIds([id]);
          return 'not-found';
        }

        return 'error';
      }
    },
    [
      clearSelectedMemoIds,
      canLoadMemoData,
      isMemoLoading,
      resetMutationErrors,
      resetRestoreMemo,
      restoreMemoAsync,
    ],
  );

  const permanentDeleteMemo = useCallback(
    async (id: string): Promise<MemoMutationStatus> => {
      if (isMemoLoading) {
        return 'loading';
      }

      if (!canLoadMemoData) {
        return 'error';
      }

      resetMutationErrors();

      try {
        await permanentDeleteMemoAsync({ memoId: id });
        clearSelectedMemoIds([id]);
        return 'success';
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          resetPermanentDeleteMemo();
          clearSelectedMemoIds([id]);
          return 'not-found';
        }

        return 'error';
      }
    },
    [
      clearSelectedMemoIds,
      canLoadMemoData,
      isMemoLoading,
      permanentDeleteMemoAsync,
      resetPermanentDeleteMemo,
      resetMutationErrors,
    ],
  );

  const authErrorMessage =
    !isCurrentUserPending && !canLoadMemoData
      ? getMemoErrorMessage(currentUserError, '로그인 정보를 확인할 수 없습니다.')
      : null;
  const queryErrorMessage = memoQueryError
    ? getMemoErrorMessage(memoQueryError, '메모를 불러오지 못했습니다.')
    : null;
  const errorMessage =
    authErrorMessage ??
    queryErrorMessage ??
    getMutationErrorMessage(
      saveMemoError,
      '메모를 저장하지 못했습니다.',
    ) ??
    getMutationErrorMessage(
      toggleMemoPinError,
      '메모 고정 상태를 변경하지 못했습니다.',
    ) ??
    getMutationErrorMessage(
      deleteMemoError,
      '메모를 삭제하지 못했습니다.',
    ) ??
    getMutationErrorMessage(
      deleteSelectedMemosError,
      '일부 메모를 삭제하지 못했습니다.',
    ) ??
    getMutationErrorMessage(
      restoreMemoError,
      '메모를 복구하지 못했습니다.',
    ) ??
    getMutationErrorMessage(
      permanentDeleteMemoError,
      '메모를 영구 삭제하지 못했습니다.',
    );

  const value = useMemo(
    () => ({
      memos,
      widgetMemos,
      isLoading: isMemoLoading,
      errorMessage,
      saveMemo,
      toggleSelectMemo,
      selectMemos,
      togglePinMemo,
      deleteMemo,
      deleteSelectedMemos,
      restoreMemo,
      permanentDeleteMemo,
    }),
    [
      memos,
      widgetMemos,
      isMemoLoading,
      errorMessage,
      saveMemo,
      toggleSelectMemo,
      selectMemos,
      togglePinMemo,
      deleteMemo,
      deleteSelectedMemos,
      restoreMemo,
      permanentDeleteMemo,
    ],
  );

  return <MemoStoreContext.Provider value={value}>{children}</MemoStoreContext.Provider>;
}

export function useMemoStore() {
  const context = useContext(MemoStoreContext);

  if (!context) {
    throw new Error('useMemoStore must be used within MemoStoreProvider');
  }

  return context;
}
