'use client';

import { useState } from 'react';

import CategoryTabs from '@/components/common/CategoryTabs';
import ListFilterBar from '@/components/common/ListFilterBar';
import AppliedJobList from './_components/AppliedJobList';
import AppliedGroupList from './_components/AppliedGroupList';

const MYPAGE_APPLICATIONS_CATEGORY_TABS = [
  { label: '채용공고', value: 'jobs' },
  { label: '그룹모집', value: 'groups' },
];

type MypageApplicationsCategoryTabValue =
  (typeof MYPAGE_APPLICATIONS_CATEGORY_TABS)[number]['value'];

export default function ApplicationsPage() {
  const [activeApplicationsTab, setActiveApplicationsTab] =
    useState<MypageApplicationsCategoryTabValue>(MYPAGE_APPLICATIONS_CATEGORY_TABS[0].value);

  return (
    <div>
      <section>
        <CategoryTabs
          items={MYPAGE_APPLICATIONS_CATEGORY_TABS}
          activeValue={activeApplicationsTab}
          onChange={setActiveApplicationsTab}
        />
        {/* // TODO: 커뮤니티 페이지 구현 후 ListFilterBar 컴포넌트 적용
        <ListFilterBar /> */}
      </section>

      {activeApplicationsTab === 'jobs' && (
        <div className="mt-5 flex flex-col gap-5">
          <AppliedJobList />
        </div>
      )}

      {activeApplicationsTab === 'groups' && (
        <div className="mt-5">
          <AppliedGroupList />
        </div>
      )}
    </div>
  );
}
