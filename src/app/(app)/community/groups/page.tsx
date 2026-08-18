'use client';

import { useSearchParams } from 'next/navigation';

import GroupPostCard from '@/components/community/groups';

import { isCommunitySort } from '@/app/(app)/community/_constants/community';

import { useGroupPosts } from '@/queries/community/useGroupPosts';
import { useToggleGroupPostLike } from '@/queries/community/useToggleGroupPostLike';

export default function CommunityGroupsPage() {
  const searchParams = useSearchParams();

  const sortParam = searchParams.get('sort');
  const sort = isCommunitySort(sortParam) ? sortParam : 'latest';
  const keyword = searchParams.get('keyword') ?? '';

  const { data: groupPosts = [], isPending, isError } = useGroupPosts({ sort, keyword });

  // TODO: API 연동 후 좋아요 캐시 갱신 방식 최적화
  const { mutate: toggleGroupPostLike } = useToggleGroupPostLike();

  if (isPending) {
    return <div>불러오는 중입니다.</div>;
  }

  if (isError) {
    return <div>그룹모집을 불러오지 못했습니다.</div>;
  }

  return (
    <div className="mx-auto grid max-w-[976px] grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {groupPosts.map((groupPost) => (
        <GroupPostCard key={groupPost.id} post={groupPost} onToggleLike={toggleGroupPostLike} />
      ))}
    </div>
  );
}
