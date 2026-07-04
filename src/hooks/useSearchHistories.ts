'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';

const SEARCH_HISTORY_EVENT_NAME = 'cheese-search-history-change';

function getStorageKey(scope: string) {
  return `cheese:search-histories:${scope}`;
}

function parseHistories(snapshot: string, fallbackHistories: readonly string[]) {
  try {
    const parsed = JSON.parse(snapshot);

    if (!Array.isArray(parsed)) {
      return [...fallbackHistories];
    }

    const histories = parsed.filter((item): item is string => typeof item === 'string');

    if (histories.length === 0) {
      return [...fallbackHistories];
    }

    return histories;
  } catch {
    return [...fallbackHistories];
  }
}

function emitSearchHistoryChange() {
  window.dispatchEvent(new Event(SEARCH_HISTORY_EVENT_NAME));
}

export function useSearchHistories(
  scope: string,
  defaultHistories: readonly string[] = [],
  maxCount = 5,
) {
  const storageKey = getStorageKey(scope);

  const defaultSnapshot = useMemo(() => {
    return JSON.stringify(defaultHistories);
  }, [defaultHistories]);

  const getSnapshot = useCallback(() => {
    if (typeof window === 'undefined') {
      return defaultSnapshot;
    }

    return window.localStorage.getItem(storageKey) ?? defaultSnapshot;
  }, [defaultSnapshot, storageKey]);

  const getServerSnapshot = useCallback(() => {
    return defaultSnapshot;
  }, [defaultSnapshot]);

  const subscribe = useCallback((onStoreChange: () => void) => {
    if (typeof window === 'undefined') {
      return () => {};
    }

    window.addEventListener('storage', onStoreChange);
    window.addEventListener(SEARCH_HISTORY_EVENT_NAME, onStoreChange);

    return () => {
      window.removeEventListener('storage', onStoreChange);
      window.removeEventListener(SEARCH_HISTORY_EVENT_NAME, onStoreChange);
    };
  }, []);

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const histories = useMemo(() => {
    return parseHistories(snapshot, defaultHistories).slice(0, maxCount);
  }, [defaultHistories, maxCount, snapshot]);

  const saveHistories = useCallback(
    (nextHistories: string[]) => {
      if (typeof window === 'undefined') return;

      window.localStorage.setItem(storageKey, JSON.stringify(nextHistories.slice(0, maxCount)));
      emitSearchHistoryChange();
    },
    [maxCount, storageKey],
  );

  const addHistory = useCallback(
    (keyword: string) => {
      const normalizedKeyword = keyword.trim();

      if (!normalizedKeyword) return;

      const nextHistories = [
        normalizedKeyword,
        ...histories.filter((history) => history !== normalizedKeyword),
      ];

      saveHistories(nextHistories);
    },
    [histories, saveHistories],
  );

  const removeHistory = useCallback(
    (keyword: string) => {
      const nextHistories = histories.filter((history) => history !== keyword);

      if (nextHistories.length === 0) {
        saveHistories([]);
        return;
      }

      saveHistories(nextHistories);
    },
    [histories, saveHistories],
  );

  const clearHistories = useCallback(() => {
    saveHistories([]);
  }, [saveHistories]);

  return {
    histories,
    addHistory,
    removeHistory,
    clearHistories,
  };
}
