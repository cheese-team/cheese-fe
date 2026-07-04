'use client';

import { useState } from 'react';

import CategoryTabs from '@/components/common/CategoryTabs';
import ListFilterBar from '@/components/common/ListFilterBar';
import JobBookmarkList from './_components/JobBookmarkList';
import GroupBookmarkList from './_components/GroupBookmarkList';
import InfoBookmarkList from './_components/InfoBookmarkList';

const MYPAGE_BOOKMARK_CATEGORY_TABS = [
  { label: '채용공고', value: 'jobs' },
  { label: '그룹모집', value: 'groups' },
  { label: '정보/자료공유', value: 'infos' },
];

type MypageBookmarkCategoryTabValue = (typeof MYPAGE_BOOKMARK_CATEGORY_TABS)[number]['value'];

export default function BookmarksPage() {
  const [activeBookmarkTab, setActiveBookmarkTab] = useState<MypageBookmarkCategoryTabValue>(
    MYPAGE_BOOKMARK_CATEGORY_TABS[0].value,
  );

  return (
    <div>
      <section>
        <CategoryTabs
          items={MYPAGE_BOOKMARK_CATEGORY_TABS}
          activeValue={activeBookmarkTab}
          onChange={setActiveBookmarkTab}
        />
        {/* // TODO: 커뮤니티 페이지 구현 후 ListFilterBar 컴포넌트 재사용
        <ListFilterBar /> */}
      </section>

      {activeBookmarkTab === 'jobs' && (
        <div className="mt-5 flex flex-col gap-5">
          <JobBookmarkList />
        </div>
      )}

      {activeBookmarkTab === 'groups' && (
        <div className="mt-5">
          <GroupBookmarkList />
        </div>
      )}

      {activeBookmarkTab === 'infos' && (
        <div className="mt-5">
          <InfoBookmarkList />
        </div>
      )}
    </div>
  );
}
