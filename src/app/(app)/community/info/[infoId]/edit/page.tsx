'use client';

import { notFound, useParams } from 'next/navigation';

import { InfoPostForm } from '../../_components';

import CommunityListState from '../../../_components/CommunityListState';
import { ApiError } from '@/api/client';
import { useInfoPost } from '@/queries/community/useInfoPost';

export default function InfoEditPage() {
  const { infoId } = useParams<{ infoId: string }>();
  const { data: infoPost, error, isPending, refetch } = useInfoPost(infoId);

  if (error instanceof ApiError && error.status === 404) {
    notFound();
  }

  if (isPending) {
    return <CommunityListState type="loading" message="로딩 중..." />;
  }

  if (error || !infoPost) {
    return (
      <CommunityListState
        type="error"
        message="정보/자료공유 게시글을 불러오지 못했습니다."
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return <InfoPostForm mode="edit" initialValues={infoPost} />;
}
