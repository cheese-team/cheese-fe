'use client';

import { useSearchParams } from 'next/navigation';

import InfoPostCard from '@/components/community/info';

import { isInfoSort } from '../_constants/community';

import { useToggleInfoPostLike } from '@/queries/community/useToggleInfoPostLike';
import { useInfoPosts } from '@/queries/community/useInfoPosts';

export default function CommunityInfoPage() {
  const searchParams = useSearchParams();

  const sortParam = searchParams.get('sort');
  const sort = isInfoSort(sortParam) ? sortParam : 'all';
  const keyword = searchParams.get('keyword') ?? '';

  const { data: infoPosts = [], isPending, isError } = useInfoPosts({ sort, keyword });

  // TODO: API 연동 후 좋아요 캐시 갱신 방식 최적화
  const { mutate: toggleInfoPostLike } = useToggleInfoPostLike();

  if (isPending) {
    return <div>불러오는 중입니다.</div>;
  }

  if (isError) {
    return <div>정보/자료공유 게시글을 불러오지 못했습니다.</div>;
  }

  return (
    <div className="mx-auto flex w-full flex-col px-[50px]">
      {infoPosts.map((infoPost) => (
        <InfoPostCard
          key={infoPost.id}
          post={infoPost}
          onToggleLike={toggleInfoPostLike}
          wrapperClassName="py-8"
        />
      ))}
    </div>
  );
}
