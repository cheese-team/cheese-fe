'use client';

import { notFound, useParams } from 'next/navigation';

import { GroupPostForm } from '../../_components';
import CommunityListState from '../../../_components/CommunityListState';

import { ApiError } from '@/api/client';
import { useGroupPost } from '@/queries/community/useGroupPost';

export default function GroupEditPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const { data: groupPost, error, isPending, refetch } = useGroupPost(groupId);

  if (error instanceof ApiError && error.status === 404) {
    notFound();
  }

  if (isPending) {
    return <CommunityListState type="loading" message="로딩 중..." />;
  }

  if (error || !groupPost) {
    return (
      <CommunityListState
        type="error"
        message="그룹모집을 불러오지 못했습니다."
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return <GroupPostForm mode="edit" groupId={groupId} initialValues={groupPost} />;
}
