'use client';

import { useSearchParams } from 'next/navigation';

import CategoryTabs from '@/components/common/CategoryTabs';
import MypageListFilterBar from '../_components/MypageListFilterBar';
import AppliedJobList from './_components/AppliedJobList';
import AppliedGroupList from './_components/AppliedGroupList';

import { APPLICATION_SORT_OPTIONS } from './_constants/applications';

import { useSearchHistories } from '@/hooks/useSearchHistories';
import { useUpdateSearchParams } from '@/hooks/useUpdateSearchParams';

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
  const searchParams = useSearchParams();
  const updateSearchParams = useUpdateSearchParams();
  const activeApplicationsTab =
    MYPAGE_APPLICATIONS_CATEGORY_TABS.find((tab) => tab.value === searchParams.get('type'))
      ?.value ?? 'jobs';

  const sort =
    APPLICATION_SORT_OPTIONS.find((option) => option.value === searchParams.get('sort'))?.value ??
    'latest';
  const keyword = searchParams.get('q') ?? '';

  const { histories: applicationSearchHistories, addHistory: addApplicationSearchHistory } =
    useSearchHistories('application', APPLICATIONS_SEARCH_HISTORIES);

  const applySearchKeyword = (value: string) => {
    const normalizedValue = value.trim();

    if (normalizedValue) {
      addApplicationSearchHistory(normalizedValue);
    }

    updateSearchParams('q', normalizedValue);
  };

  const handleApplicationsTabChange = (value: MypageApplicationsCategoryTabValue) => {
    updateSearchParams({ type: value, sort: 'latest', q: null });
  };

  return (
    <div>
      <section className="flex flex-col gap-5">
        <CategoryTabs
          items={MYPAGE_APPLICATIONS_CATEGORY_TABS}
          activeValue={activeApplicationsTab}
          onChange={handleApplicationsTabChange}
        />

        <MypageListFilterBar
          sortOptions={APPLICATION_SORT_OPTIONS}
          selectedSort={sort}
          searchValue={keyword}
          searchPlaceholder="검색"
          searchHistories={applicationSearchHistories}
          onSortChange={(value) => updateSearchParams('sort', value)}
          onSearchSubmit={applySearchKeyword}
          onSearchClear={() => {
            updateSearchParams('q', '');
          }}
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
