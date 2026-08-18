import { notFound } from 'next/navigation';

import { JobPostForm } from '../../_components';

import { jobPosts } from '@/mocks/posts';

export default async function JobEditPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;

  const jobPost = jobPosts.find((post) => post.id === Number(jobId));

  if (!jobPost) {
    notFound();
  }

  return <JobPostForm mode="edit" initialValues={jobPost} />;
}
