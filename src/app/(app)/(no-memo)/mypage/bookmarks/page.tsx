'use client';

import { useState } from 'react';

import CategoryTabs from '@/components/common/CategoryTabs';
import ListFilterBar from '@/components/common/ListFilterBar';

import { useSearchHistories } from '@/hooks/useSearchHistories';

import { GroupBookmarkList, InfoBookmarkList, JobBookmarkList } from './_components';

import {
  COMMUNITY_SORT_OPTIONS,
  INFO_SORT_OPTIONS,
} from '@/app/(app)/community/_constants/community';

const MYPAGE_BOOKMARK_CATEGORY_TABS = [
  { label: '채용공고', value: 'jobs' },
  { label: '그룹모집', value: 'groups' },
  { label: '정보/자료공유', value: 'info' },
] as const;

const BOOKMARK_SEARCH_HISTORIES = ['프론트엔드', '스터디 모집', '포트폴리오', '채용공고'] as const;

type BookmarkCategory = (typeof MYPAGE_BOOKMARK_CATEGORY_TABS)[number]['value'];
type CommunitySort = (typeof COMMUNITY_SORT_OPTIONS)[number]['value'];
type InfoSort = (typeof INFO_SORT_OPTIONS)[number]['value'];

export default function BookmarksPage() {
  const [activeBookmarkTab, setActiveBookmarkTab] = useState<BookmarkCategory>(
    MYPAGE_BOOKMARK_CATEGORY_TABS[0].value,
  );
  const [communitySort, setCommunitySort] = useState<CommunitySort>('latest');
  const [infoSort, setInfoSort] = useState<InfoSort>('all');
  const [bookmarkKeyword, setBookmarkKeyword] = useState('');

  const { histories: bookmarkSearchHistories, addHistory: addBookmarkSearchHistory } =
    useSearchHistories('bookmark', BOOKMARK_SEARCH_HISTORIES);

  const handleBookmarkTabChange = (value: BookmarkCategory) => {
    setActiveBookmarkTab(value);
    setBookmarkKeyword('');

    if (value === 'info') {
      setInfoSort('all');
      return;
    }

    setCommunitySort('latest');
  };

  const handleKeywordChange = (value: string) => {
    setBookmarkKeyword(value);
  };

  const handleSearchSubmit = (value: string) => {
    const normalizedValue = value.trim();

    if (normalizedValue) {
      addBookmarkSearchHistory(normalizedValue);
    }

    setBookmarkKeyword(normalizedValue);
  };

  const handleSearchClear = () => {
    setBookmarkKeyword('');
  };

  const handleSearchHistorySelect = (value: string) => {
    const normalizedValue = value.trim();

    if (normalizedValue) {
      addBookmarkSearchHistory(normalizedValue);
    }

    setBookmarkKeyword(normalizedValue);
  };

  return (
    <div>
      <section className="flex flex-col gap-5">
        <CategoryTabs
          items={MYPAGE_BOOKMARK_CATEGORY_TABS}
          activeValue={activeBookmarkTab}
          onChange={handleBookmarkTabChange}
        />

        {activeBookmarkTab === 'info' ? (
          <ListFilterBar
            sortOptions={INFO_SORT_OPTIONS}
            selectedSort={infoSort}
            searchValue={bookmarkKeyword}
            searchPlaceholder="검색"
            searchHistories={bookmarkSearchHistories}
            onSortChange={setInfoSort}
            onSearchChange={handleKeywordChange}
            onSearchSubmit={handleSearchSubmit}
            onSearchClear={handleSearchClear}
            onSearchHistorySelect={handleSearchHistorySelect}
            className="gap-3"
          />
        ) : (
          <ListFilterBar
            sortOptions={COMMUNITY_SORT_OPTIONS}
            selectedSort={communitySort}
            searchValue={bookmarkKeyword}
            searchPlaceholder="검색"
            searchHistories={bookmarkSearchHistories}
            onSortChange={setCommunitySort}
            onSearchChange={handleKeywordChange}
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
            <InfoBookmarkList sort={infoSort} keyword={bookmarkKeyword} />
          </div>
        )}
      </section>
    </div>
  );
}
