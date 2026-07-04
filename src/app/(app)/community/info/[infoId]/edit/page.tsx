import { notFound } from 'next/navigation';

import InfoPostForm from '../../_components/InfoPostForm';

import { infoPosts } from '@/mocks/posts';

export default async function InfoEditPage({ params }: { params: Promise<{ infoId: string }> }) {
  const { infoId } = await params;

  const infoPost = infoPosts.find((post) => post.id === Number(infoId));

  if (!infoPost) {
    notFound();
  }

  return <InfoPostForm mode="edit" initialValues={infoPost} />;
}
