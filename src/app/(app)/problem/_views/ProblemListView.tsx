'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';

import { CategoryTabs } from '@/components/common/CategoryTabs';
import { ListFilterBar } from '@/components/common/ListFilterBar';
import { useSearchHistories } from '@/hooks/useSearchHistories';

import ProblemCardGrid from '../_components/ProblemCardGrid';
import ProblemSubCategoryTabs from '../_components/ProblemSubCategoryTabs';
import {
  PROBLEM_MAIN_CATEGORY_TABS,
  PROBLEM_SORT_OPTIONS,
  PROBLEM_SUB_CATEGORY_TABS,
} from '../_constants/problemFilters';
import { mockProblemSets } from '../_data/mockProblemSets';
import type {
  ProblemMainCategory,
  ProblemSet,
  ProblemSortValue,
  ProblemSubCategory,
} from '../_types/problem';
import { filterProblemSets } from '../_utils/filterProblemSets';
import { formatProgressDate } from '../_utils/formatProgressDate';

const PAGE_SIZE = 12;
const PROBLEM_PROGRESS_EVENT = 'cheese:problem-progress-change';

const PROBLEM_SEARCH_HISTORIES = ['CSS', 'Next.js', 'cursor', '표준모드', '라우팅'] as const;

type SavedProblemProgress = Pick<ProblemSet, 'lastProgressDate' | 'solvedCount'>;

function getSavedProblemProgress(problemSet: ProblemSet): SavedProblemProgress | null {
  try {
    const storedValue = window.sessionStorage.getItem(`cheese:problem-session:${problemSet.id}`);

    if (!storedValue) {
      return null;
    }

    const storedSession = JSON.parse(storedValue) as {
      attempts?: Record<string, { submitted?: unknown }>;
      lastProgressDate?: unknown;
    };
    const attempts =
      storedSession.attempts && typeof storedSession.attempts === 'object'
        ? storedSession.attempts
        : {};
    const solvedCount = Object.values(attempts).filter(
      (attempt) => attempt?.submitted === true,
    ).length;

    if (solvedCount === 0) {
      return null;
    }

    return {
      solvedCount: Math.min(solvedCount, problemSet.totalCount),
      lastProgressDate:
        typeof storedSession.lastProgressDate === 'string'
          ? storedSession.lastProgressDate
          : formatProgressDate(),
    };
  } catch {
    return null;
  }
}

function getSavedProgressSnapshot() {
  if (typeof window === 'undefined') {
    return '{}';
  }

  const savedProgress = mockProblemSets.reduce<Record<string, SavedProblemProgress>>(
    (nextProgress, problemSet) => {
      const problemProgress = getSavedProblemProgress(problemSet);

      if (problemProgress) {
        nextProgress[problemSet.id] = problemProgress;
      }

      return nextProgress;
    },
    {},
  );

  return JSON.stringify(savedProgress);
}

const getEmptyProgressSnapshot = () => '{}';

function migrateSavedProgressDates() {
  let didMigrate = false;

  mockProblemSets.forEach((problemSet) => {
    const storageKey = `cheese:problem-session:${problemSet.id}`;

    try {
      const storedValue = window.sessionStorage.getItem(storageKey);

      if (!storedValue) {
        return;
      }

      const storedSession = JSON.parse(storedValue) as {
        attempts?: Record<string, { submitted?: unknown }>;
        lastProgressDate?: unknown;
      };
      const hasSubmittedAttempt = Object.values(storedSession.attempts ?? {}).some(
        (attempt) => attempt?.submitted === true,
      );

      if (!hasSubmittedAttempt || typeof storedSession.lastProgressDate === 'string') {
        return;
      }

      window.sessionStorage.setItem(
        storageKey,
        JSON.stringify({ ...storedSession, lastProgressDate: formatProgressDate() }),
      );
      didMigrate = true;
    } catch {
      return;
    }
  });

  if (didMigrate) {
    window.dispatchEvent(new Event(PROBLEM_PROGRESS_EVENT));
  }
}

function subscribeToSavedProgress(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange);
  window.addEventListener(PROBLEM_PROGRESS_EVENT, onStoreChange);

  return () => {
    window.removeEventListener('storage', onStoreChange);
    window.removeEventListener(PROBLEM_PROGRESS_EVENT, onStoreChange);
  };
}

function ProblemListView() {
  const [sort, setSort] = useState<ProblemSortValue>('latest');
  const [keyword, setKeyword] = useState('');
  const [mainCategory, setMainCategory] = useState<ProblemMainCategory>('all');
  const [subCategory, setSubCategory] = useState<ProblemSubCategory>('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const savedProgressSnapshot = useSyncExternalStore(
    subscribeToSavedProgress,
    getSavedProgressSnapshot,
    getEmptyProgressSnapshot,
  );
  const savedProgressByProblemSetId = useMemo(
    () => JSON.parse(savedProgressSnapshot) as Record<string, SavedProblemProgress>,
    [savedProgressSnapshot],
  );

  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const { histories: problemSearchHistories, addHistory: addProblemSearchHistory } =
    useSearchHistories('problem', PROBLEM_SEARCH_HISTORIES);

  const subCategoryItems = PROBLEM_SUB_CATEGORY_TABS[mainCategory] ?? [];

  const problemSetsWithProgress = useMemo(
    () =>
      mockProblemSets.map((problemSet) => ({
        ...problemSet,
        ...savedProgressByProblemSetId[problemSet.id],
      })),
    [savedProgressByProblemSetId],
  );

  const filteredProblemSets = useMemo(() => {
    return filterProblemSets({
      problemSets: problemSetsWithProgress,
      mainCategory,
      subCategory,
      keyword,
      sort,
    });
  }, [keyword, mainCategory, problemSetsWithProgress, sort, subCategory]);

  const visibleProblemSets = filteredProblemSets.slice(0, visibleCount);
  const hasMoreProblemSets = visibleCount < filteredProblemSets.length;

  const resetVisibleProblemSets = () => {
    setVisibleCount(PAGE_SIZE);

    scrollAreaRef.current?.scrollTo({
      top: 0,
      behavior: 'auto',
    });
  };

  const handleSortChange = (value: ProblemSortValue) => {
    setSort(value);
    resetVisibleProblemSets();
  };

  const handleKeywordChange = (value: string) => {
    setKeyword(value);
    resetVisibleProblemSets();
  };

  const handleSearchSubmit = (value: string) => {
    const normalizedValue = value.trim();

    if (normalizedValue) {
      addProblemSearchHistory(normalizedValue);
    }

    setKeyword(normalizedValue);
    resetVisibleProblemSets();
  };

  const handleSearchClear = () => {
    setKeyword('');
    resetVisibleProblemSets();
  };

  const handleSearchHistorySelect = (value: string) => {
    const normalizedValue = value.trim();

    if (normalizedValue) {
      addProblemSearchHistory(normalizedValue);
    }

    setKeyword(normalizedValue);
    resetVisibleProblemSets();
  };

  const handleMainCategoryChange = (value: ProblemMainCategory) => {
    setMainCategory(value);
    setSubCategory('all');
    resetVisibleProblemSets();
  };

  const handleSubCategoryChange = (value: ProblemSubCategory) => {
    setSubCategory(value);
    resetVisibleProblemSets();
  };

  useEffect(() => {
    migrateSavedProgressDates();
  }, []);

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    const target = loadMoreRef.current;

    if (!scrollArea || !target || !hasMoreProblemSets) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        setVisibleCount((prevVisibleCount) =>
          Math.min(prevVisibleCount + PAGE_SIZE, filteredProblemSets.length),
        );
      },
      {
        root: scrollArea,
        rootMargin: '240px 0px',
        threshold: 0,
      },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [filteredProblemSets.length, hasMoreProblemSets]);

  return (
    <main className="min-h-0">
      <div
        ref={scrollAreaRef}
        className="h-dvh min-h-0 overflow-y-auto overscroll-contain px-10 pt-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <section className="mx-auto mb-8 flex w-full max-w-[1100px] flex-col gap-8 pb-[100px]">
          <div className="flex flex-col gap-5">
            <ListFilterBar
              sortOptions={PROBLEM_SORT_OPTIONS}
              selectedSort={sort}
              searchValue={keyword}
              searchPlaceholder="검색"
              searchHistories={problemSearchHistories}
              onSortChange={handleSortChange}
              onSearchChange={handleKeywordChange}
              onSearchSubmit={handleSearchSubmit}
              onSearchClear={handleSearchClear}
              onSearchHistorySelect={handleSearchHistorySelect}
            />

            <CategoryTabs
              items={PROBLEM_MAIN_CATEGORY_TABS}
              activeValue={mainCategory}
              onChange={handleMainCategoryChange}
            />

            {subCategoryItems.length > 0 && (
              <ProblemSubCategoryTabs
                items={subCategoryItems}
                activeValue={subCategory}
                onChange={handleSubCategoryChange}
              />
            )}
          </div>

          <ProblemCardGrid problemSets={visibleProblemSets} />

          {hasMoreProblemSets && (
            <div ref={loadMoreRef} className="flex h-[96px] items-center justify-center">
              <span className="text-text-muted text-[13px] font-medium">더 불러오는 중...</span>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export { ProblemListView };
export default ProblemListView;
