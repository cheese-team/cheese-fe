import { notFound } from 'next/navigation';

import { GroupPostForm } from '../../_components';

import { groupPosts } from '@/mocks/posts';

export default async function GroupEditPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;

  const groupPost = groupPosts.find((post) => post.id === Number(groupId));

  if (!groupPost) {
    notFound();
  }

  return <GroupPostForm mode="edit" initialValues={groupPost} />;
}
