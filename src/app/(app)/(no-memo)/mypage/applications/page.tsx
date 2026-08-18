'use client';

import { useState } from 'react';

import CategoryTabs from '@/components/common/CategoryTabs';
import ListFilterBar from '@/components/common/ListFilterBar';
import AppliedJobList from './_components/AppliedJobList';
import AppliedGroupList from './_components/AppliedGroupList';

import {
  COMMUNITY_SORT_OPTIONS,
  type CommunitySort,
} from '@/app/(app)/community/_constants/community';

import { useSearchHistories } from '@/hooks/useSearchHistories';

const MYPAGE_APPLICATIONS_CATEGORY_TABS = [
  { label: '채용공고', value: 'jobs' },
  { label: '그룹모집', value: 'groups' },
] as const;

const APPLICATIONS_SEARCH_HISTORIES = [
  '프론트엔드',
  '스터디 모집',
  '포트폴리오',
  '채용공고',
] as const;

type MypageApplicationsCategoryTabValue =
  (typeof MYPAGE_APPLICATIONS_CATEGORY_TABS)[number]['value'];

export default function ApplicationsPage() {
  const [activeApplicationsTab, setActiveApplicationsTab] =
    useState<MypageApplicationsCategoryTabValue>('jobs');

  const [sort, setSort] = useState<CommunitySort>('latest');
  const [keyword, setKeyword] = useState('');

  const { histories: applicationSearchHistories, addHistory: addApplicationSearchHistory } =
    useSearchHistories('application', APPLICATIONS_SEARCH_HISTORIES);

  const applySearchKeyword = (value: string) => {
    const normalizedValue = value.trim();

    if (normalizedValue) {
      addApplicationSearchHistory(normalizedValue);
    }

    setKeyword(normalizedValue);
  };

  const handleApplicationsTabChange = (value: MypageApplicationsCategoryTabValue) => {
    setActiveApplicationsTab(value);
    setSort('latest');
    setKeyword('');
  };

  return (
    <div>
      <section className="flex flex-col gap-5">
        <CategoryTabs
          items={MYPAGE_APPLICATIONS_CATEGORY_TABS}
          activeValue={activeApplicationsTab}
          onChange={handleApplicationsTabChange}
        />

        <ListFilterBar
          sortOptions={COMMUNITY_SORT_OPTIONS}
          selectedSort={sort}
          searchValue={keyword}
          searchPlaceholder="검색"
          searchHistories={applicationSearchHistories}
          onSortChange={setSort}
          onSearchChange={setKeyword}
          onSearchSubmit={applySearchKeyword}
          onSearchClear={() => setKeyword('')}
          onSearchHistorySelect={applySearchKeyword}
          className="gap-3"
        />

        {activeApplicationsTab === 'jobs' && (
          <div className="flex flex-col gap-5">
            <AppliedJobList sort={sort} keyword={keyword} />
          </div>
        )}

        {activeApplicationsTab === 'groups' && <AppliedGroupList sort={sort} keyword={keyword} />}
      </section>
    </div>
  );
}
