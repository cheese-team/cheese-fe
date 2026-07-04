'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

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
import type { ProblemMainCategory, ProblemSortValue, ProblemSubCategory } from '../_types/problem';
import { filterProblemSets } from '../_utils/filterProblemSets';

const PAGE_SIZE = 12;

const PROBLEM_SEARCH_HISTORIES = ['CSS', 'Next.js', 'cursor', '표준모드', '라우팅'] as const;

function ProblemListView() {
  const [sort, setSort] = useState<ProblemSortValue>('latest');
  const [keyword, setKeyword] = useState('');
  const [mainCategory, setMainCategory] = useState<ProblemMainCategory>('all');
  const [subCategory, setSubCategory] = useState<ProblemSubCategory>('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const { histories: problemSearchHistories, addHistory: addProblemSearchHistory } =
    useSearchHistories('problem', PROBLEM_SEARCH_HISTORIES);

  const subCategoryItems = PROBLEM_SUB_CATEGORY_TABS[mainCategory] ?? [];

  const filteredProblemSets = useMemo(() => {
    return filterProblemSets({
      problemSets: mockProblemSets,
      mainCategory,
      subCategory,
      keyword,
      sort,
    });
  }, [keyword, mainCategory, sort, subCategory]);

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
        className="h-dvh min-h-0 overflow-y-auto overscroll-contain px-10 pt-10"
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
