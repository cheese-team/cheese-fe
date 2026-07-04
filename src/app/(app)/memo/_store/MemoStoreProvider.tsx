'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { mockMemos } from '../_data/mockMemos';
import type { Memo } from '../_types/memo';

const MEMO_STORAGE_KEY = 'cheese:memos:v1';

export type MemoSavePayload = Omit<Memo, 'id' | 'createdAt'> &
  Partial<Pick<Memo, 'id' | 'createdAt'>>;

type MemoStoreContextValue = {
  memos: Memo[];
  saveMemo: (memo: MemoSavePayload) => void;
  toggleSelectMemo: (id: string) => void;
  selectMemos: (ids: string[], selected: boolean) => void;
  togglePinMemo: (id: string) => void;
  deleteMemo: (id: string) => void;
  deleteSelectedMemos: () => void;
  restoreMemo: (id: string) => void;
  permanentDeleteMemo: (id: string) => void;
};

const MemoStoreContext = createContext<MemoStoreContextValue | null>(null);

function getTodayText() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const date = `${now.getDate()}`.padStart(2, '0');

  return `${year}. ${month}. ${date}`;
}

function createMemoId() {
  if (typeof globalThis.crypto !== 'undefined' && 'randomUUID' in globalThis.crypto) {
    return globalThis.crypto.randomUUID();
  }

  return `memo-${Date.now()}`;
}

function normalizeMemos(memos: Memo[]) {
  return memos.map((memo) => ({
    ...memo,
    selected: false,
  }));
}

function getMockMemos() {
  return normalizeMemos(mockMemos);
}

function readStoredMemos() {
  try {
    const storedMemos = window.localStorage.getItem(MEMO_STORAGE_KEY);

    if (!storedMemos) {
      return null;
    }

    const parsedMemos = JSON.parse(storedMemos);

    if (!Array.isArray(parsedMemos)) {
      return null;
    }

    /**
     * mock 개발 단계에서는 localStorage에 빈 배열이 남아 있으면
     * 더미데이터가 계속 사라져 보이므로 mockMemos를 다시 사용한다.
     *
     * 실제 API 연동 후에는 이 조건을 제거하는 것이 맞다.
     */
    if (parsedMemos.length === 0) {
      return null;
    }

    return normalizeMemos(parsedMemos as Memo[]);
  } catch {
    return null;
  }
}

function writeStoredMemos(memos: Memo[]) {
  try {
    window.localStorage.setItem(MEMO_STORAGE_KEY, JSON.stringify(memos));
  } catch {
    // localStorage 저장 실패는 mock UI 동작을 막지 않음
  }
}

export function MemoStoreProvider({ children }: { children: ReactNode }) {
  const [memos, setMemos] = useState<Memo[]>(getMockMemos);
  const storageReadyRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const timerId = window.setTimeout(() => {
      if (cancelled) return;

      const storedMemos = readStoredMemos();

      if (storedMemos) {
        setMemos(storedMemos);
      }

      storageReadyRef.current = true;
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
    };
  }, []);

  useEffect(() => {
    if (!storageReadyRef.current) return;

    writeStoredMemos(memos);
  }, [memos]);

  const saveMemo = useCallback((nextMemo: MemoSavePayload) => {
    setMemos((prevMemos) => {
      if (nextMemo.id) {
        return prevMemos.map((memo) =>
          memo.id === nextMemo.id
            ? {
                ...memo,
                title: nextMemo.title ?? memo.title,
                content: nextMemo.content ?? memo.content,
                createdAt: nextMemo.createdAt ?? memo.createdAt,
                color: nextMemo.color ?? memo.color,
                pinned: nextMemo.pinned ?? memo.pinned,
                imageSrc: nextMemo.imageSrc,
                selected: nextMemo.selected ?? memo.selected ?? false,
                deleted: nextMemo.deleted ?? memo.deleted ?? false,
              }
            : memo,
        );
      }

      return [
        {
          id: createMemoId(),
          title: nextMemo.title || '제목',
          content: nextMemo.content || '',
          createdAt: getTodayText(),
          color: nextMemo.color ?? 'gray',
          pinned: Boolean(nextMemo.pinned),
          imageSrc: nextMemo.imageSrc,
          selected: false,
          deleted: false,
        },
        ...prevMemos,
      ];
    });
  }, []);

  const toggleSelectMemo = useCallback((id: string) => {
    setMemos((prevMemos) =>
      prevMemos.map((memo) =>
        memo.id === id
          ? {
              ...memo,
              selected: !memo.selected,
            }
          : memo,
      ),
    );
  }, []);

  const selectMemos = useCallback((ids: string[], selected: boolean) => {
    const targetIds = new Set(ids);

    setMemos((prevMemos) =>
      prevMemos.map((memo) =>
        targetIds.has(memo.id)
          ? {
              ...memo,
              selected,
            }
          : memo,
      ),
    );
  }, []);

  const togglePinMemo = useCallback((id: string) => {
    setMemos((prevMemos) =>
      prevMemos.map((memo) =>
        memo.id === id
          ? {
              ...memo,
              pinned: !memo.pinned,
            }
          : memo,
      ),
    );
  }, []);

  const deleteMemo = useCallback((id: string) => {
    setMemos((prevMemos) =>
      prevMemos.map((memo) =>
        memo.id === id
          ? {
              ...memo,
              selected: false,
              deleted: true,
            }
          : memo,
      ),
    );
  }, []);

  const deleteSelectedMemos = useCallback(() => {
    setMemos((prevMemos) =>
      prevMemos.map((memo) =>
        memo.selected && !memo.deleted
          ? {
              ...memo,
              selected: false,
              deleted: true,
            }
          : memo,
      ),
    );
  }, []);

  const restoreMemo = useCallback((id: string) => {
    setMemos((prevMemos) =>
      prevMemos.map((memo) =>
        memo.id === id
          ? {
              ...memo,
              deleted: false,
              selected: false,
            }
          : memo,
      ),
    );
  }, []);

  const permanentDeleteMemo = useCallback((id: string) => {
    setMemos((prevMemos) => prevMemos.filter((memo) => memo.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      memos,
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
