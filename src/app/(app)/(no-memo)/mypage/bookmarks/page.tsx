'use client';

import { useSearchParams } from 'next/navigation';

import CategoryTabs from '@/components/common/CategoryTabs';
import MypageListFilterBar from '../_components/MypageListFilterBar';

import { useSearchHistories } from '@/hooks/useSearchHistories';
import { useUpdateSearchParams } from '@/hooks/useUpdateSearchParams';

import { GroupBookmarkList, InfoBookmarkList, JobBookmarkList } from './_components';

import { COMMUNITY_SORT_OPTIONS } from '@/app/(app)/community/_constants/community';

const MYPAGE_BOOKMARK_CATEGORY_TABS = [
  { label: '채용공고', value: 'jobs' },
  { label: '그룹모집', value: 'groups' },
  { label: '정보/자료공유', value: 'info' },
] as const;

const BOOKMARK_SEARCH_HISTORIES = ['프론트엔드', '스터디 모집', '포트폴리오', '채용공고'] as const;

type BookmarkCategory = (typeof MYPAGE_BOOKMARK_CATEGORY_TABS)[number]['value'];

export default function BookmarksPage() {
  const searchParams = useSearchParams();
  const updateSearchParams = useUpdateSearchParams();
  const activeBookmarkTab =
    MYPAGE_BOOKMARK_CATEGORY_TABS.find((tab) => tab.value === searchParams.get('type'))?.value ??
    'jobs';
  const communitySort =
    COMMUNITY_SORT_OPTIONS.find((option) => option.value === searchParams.get('sort'))?.value ??
    'latest';
  const bookmarkKeyword = searchParams.get('q') ?? '';

  const { histories: bookmarkSearchHistories, addHistory: addBookmarkSearchHistory } =
    useSearchHistories('bookmark', BOOKMARK_SEARCH_HISTORIES);

  const handleBookmarkTabChange = (value: BookmarkCategory) => {
    updateSearchParams({ type: value, sort: value === 'info' ? 'all' : 'latest', q: null });
  };

  const handleSearchSubmit = (value: string) => {
    const normalizedValue = value.trim();

    if (normalizedValue) {
      addBookmarkSearchHistory(normalizedValue);
    }

    updateSearchParams('q', normalizedValue);
  };

  const handleSearchClear = () => {
    updateSearchParams('q', '');
  };

  const handleSearchHistorySelect = (value: string) => {
    const normalizedValue = value.trim();

    if (normalizedValue) {
      addBookmarkSearchHistory(normalizedValue);
    }

    updateSearchParams('q', normalizedValue);
  };

  return (
    <div>
      <section className="flex flex-col gap-5">
        <CategoryTabs
          items={MYPAGE_BOOKMARK_CATEGORY_TABS}
          activeValue={activeBookmarkTab}
          onChange={handleBookmarkTabChange}
        />

        {activeBookmarkTab !== 'info' && (
          <MypageListFilterBar
            sortOptions={COMMUNITY_SORT_OPTIONS}
            selectedSort={communitySort}
            searchValue={bookmarkKeyword}
            searchPlaceholder="검색"
            searchHistories={bookmarkSearchHistories}
            onSortChange={(value) => updateSearchParams('sort', value)}
            onSearchSubmit={handleSearchSubmit}
            onSearchClear={handleSearchClear}
            onSearchHistorySelect={handleSearchHistorySelect}
            className="gap-3"
          />
        )}

        {activeBookmarkTab === 'jobs' && (
          <div className="flex flex-col gap-5">
            <JobBookmarkList sort={communitySort} keyword={bookmarkKeyword} />
          </div>
        )}

        {activeBookmarkTab === 'groups' && (
          <div className="">
            <GroupBookmarkList sort={communitySort} keyword={bookmarkKeyword} />
          </div>
        )}

        {activeBookmarkTab === 'info' && (
          <div className="">
            <InfoBookmarkList />
          </div>
        )}
      </section>
    </div>
  );
}
