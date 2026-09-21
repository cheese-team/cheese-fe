import { apiClient } from '@/api/client';

import type { Memo, MemoColor } from '@/app/(app)/memo/_types/memo';

type MemoResponse = {
  id: string;
  title: string;
  contentHtml: string;
  contentText: string;
  color?: MemoColor | null;
  pinned: boolean;
  deleted: boolean;
  imageUrl?: string | null;
  imageFileId?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

export type MemoDraft = {
  title: string;
  contentHtml: string;
  contentText: string;
  color?: MemoColor | null;
  pinned?: boolean;
  imageFileId?: string | null;
};

type GetMemosParams = {
  userId: string;
  deleted?: boolean;
  signal?: AbortSignal;
};

type GetWidgetMemosParams = {
  userId: string;
  limit?: number;
  signal?: AbortSignal;
};

type CreateMemoParams = {
  userId: string;
  draft: MemoDraft;
};

type MemoMutationParams = {
  userId: string;
  memoId: string;
};

type UpdateMemoParams = MemoMutationParams & {
  draft: Omit<MemoDraft, 'pinned'>;
};

type UpdateMemoPinParams = MemoMutationParams & {
  pinned: boolean;
};

function toMemo(response: MemoResponse): Memo {
  return {
    id: response.id,
    title: response.title,
    content: response.contentHtml,
    contentText: response.contentText,
    createdAt: response.createdAt,
    updatedAt: response.updatedAt,
    color: response.color ?? undefined,
    pinned: response.pinned,
    imageSrc: response.imageUrl ?? undefined,
    imageFileId: response.imageFileId ?? undefined,
    selected: false,
    deleted: response.deleted,
    deletedAt: response.deletedAt ?? undefined,
  };
}

export async function getMemos({ deleted = false, signal }: GetMemosParams) {
  const memos = await apiClient<MemoResponse[]>('/backend-api/memos', {
    method: 'GET',
    query: { deleted: String(deleted) },
    signal,
    cache: 'no-store',
  });

  return memos.map(toMemo);
}

export async function getWidgetMemos({ limit = 5, signal }: GetWidgetMemosParams) {
  const memos = await apiClient<MemoResponse[]>('/backend-api/memos/widget', {
    method: 'GET',
    query: { limit: String(limit) },
    signal,
    cache: 'no-store',
  });

  return memos.map(toMemo);
}

export async function createMemo({ draft }: CreateMemoParams) {
  const memo = await apiClient<MemoResponse>('/backend-api/memos', {
    method: 'POST',
    body: JSON.stringify(draft),
  });

  return toMemo(memo);
}

export async function updateMemo({ memoId, draft }: UpdateMemoParams) {
  const memo = await apiClient<MemoResponse>(`/backend-api/memos/${memoId}`, {
    method: 'PATCH',
    body: JSON.stringify(draft),
  });

  return toMemo(memo);
}

export async function updateMemoPin({ memoId, pinned }: UpdateMemoPinParams) {
  const memo = await apiClient<MemoResponse>(`/backend-api/memos/${memoId}/pin`, {
    method: 'PATCH',
    body: JSON.stringify({ pinned }),
  });

  return toMemo(memo);
}

export async function deleteMemo({ memoId }: MemoMutationParams) {
  const memo = await apiClient<MemoResponse>(`/backend-api/memos/${memoId}`, {
    method: 'DELETE',
  });

  return toMemo(memo);
}

export async function restoreMemo({ memoId }: MemoMutationParams) {
  const memo = await apiClient<MemoResponse>(`/backend-api/memos/${memoId}/restore`, {
    method: 'POST',
  });

  return toMemo(memo);
}

export function permanentDeleteMemo({ memoId }: MemoMutationParams) {
  return apiClient<{ success: boolean }>(`/backend-api/memos/${memoId}/permanent`, {
    method: 'DELETE',
  });
}
